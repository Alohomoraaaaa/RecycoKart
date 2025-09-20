import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

// Custom icons
const userIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const collectorIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const dropOffIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Haversine distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

function PickupResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scrapTypes, time, userLat, userLng, address, date, pickupAddress } = location.state;

  const [collectors, setCollectors] = useState([]);
  const [selectedCollectors, setSelectedCollectors] = useState([]);
  const [userData, setUserData] = useState({}); // store user details

  const [dropOffPoints, setDropOffPoints] = useState([]);
  const [nearestDropOff, setNearestDropOff] = useState(null);

  // Fetch current user details (name, phone)
  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserDetails();
  }, []);

  // Fetch collectors matching criteria
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "collector"));
        const querySnapshot = await getDocs(q);

        const collectorSnap = await getDocs(collection(db, "collectors"));

        const matchedCollectors = [];

        for (const userDoc of querySnapshot.docs) {
          const collectorData = collectorSnap.docs.find((d) => d.id === userDoc.id)?.data();

          if (collectorData) {
            const matchingScrapTypes = collectorData.scrapTypes?.filter((type) =>
              scrapTypes.includes(type)
            );

            const hasScrap = matchingScrapTypes.length > 0;
            const start = collectorData.availability?.start;
            const end = collectorData.availability?.end;
            const matchesTime = time >= start && time <= end;

            if (hasScrap && matchesTime) {
              const distance = getDistance(userLat, userLng, collectorData.lat, collectorData.lng);

              if (distance <= 10) {
                matchedCollectors.push({
                  id: userDoc.id,
                  name: userDoc.data().name,
                  lat: collectorData.lat,
                  lng: collectorData.lng,
                  distance,
                  matchingScrapTypes,
                });
              }
            }
          }
        }

        matchedCollectors.sort((a, b) => a.distance - b.distance);
        setCollectors(matchedCollectors);
      } catch (err) {
        console.error("Error fetching collectors:", err);
      }
    };

    fetchCollectors();
  }, [scrapTypes, time, userLat, userLng]);

  // Fetch drop-off points and find nearest
  useEffect(() => {
    const fetchDropOffPoints = async () => {
      try {
        const dropOffRef = collection(db, "dropOffPoints");
        const dropOffSnapshot = await getDocs(dropOffRef);
        const activeDropOffs = dropOffSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(d => d.dfactive);

        // Calculate distance for each drop-off point
        const withDistance = activeDropOffs.map(d => {
          const distance = getDistance(userLat, userLng, d.dflat, d.dflong);
          return { ...d, distance };
        });

        // Sort by nearest
        withDistance.sort((a, b) => a.distance - b.distance);

        setDropOffPoints(withDistance);
        setNearestDropOff(withDistance[0] || null);
      } catch (error) {
        console.error("Error fetching drop-off points:", error);
      }
    };

    if (userLat && userLng) {
      fetchDropOffPoints();
    }
  }, [userLat, userLng]);

  const toggleCollector = (col) => {
    setSelectedCollectors((prev) =>
      prev.find((c) => c.id === col.id) ? prev.filter((c) => c.id !== col.id) : [...prev, col]
    );
  };

  const handleRequest = async () => {
    if (selectedCollectors.length === 0) return alert("Please select at least one collector!");

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to send a request.");
      return;
    }

    for (const col of selectedCollectors) {
      const requestRef = doc(db, "pickupRequests", `${Date.now()}_${col.id}`);
      await setDoc(requestRef, {
        userId: user.uid,
        userName: userData.name || "",
        userPhone: userData.contact || "",
        collectorId: col.id,
        collectorName: col.name,
        scrapTypes: col.matchingScrapTypes,
        date,
        time,
        status: "pending",
        userLat,
        userLng,
        pickupAddress,
        address,
      });
    }

    navigate("/dashboard");
  };

  return (
    <div className="page-bg">
      <div className="glass-card" style={{ maxWidth: 1100, width: "100%", padding: "32px", margin: "0 auto" }}>
        <h2 className="text-center text-success mb-4">Choose Your Collectors</h2>

      <div className="row">
        {/* Map Section */}
        <div className="col-md-6 mb-4">
          <div className="shadow rounded" style={{ height: "420px", overflow: "hidden" }}>
            <MapContainer
              center={[userLat, userLng]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker position={[userLat, userLng]} icon={userIcon}>
                <Popup>Your Location</Popup>
              </Marker>

              {collectors.map((col) => (
                <Marker
                  key={col.id}
                  position={[col.lat, col.lng]}
                  icon={collectorIcon}
                  eventHandlers={{ click: () => toggleCollector(col) }}
                >
                  <Popup>
                    <strong>{col.name}</strong> <br />
                    {col.distance.toFixed(2)} km away <br />
                    <b>
                      {selectedCollectors.find((c) => c.id === col.id)
                        ? "✅ Selected"
                        : "Click to Select"}
                    </b>
                  </Popup>
                </Marker>
              ))}

              {dropOffPoints.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.dflat, point.dflong]}
                  icon={dropOffIcon}
                >
                  <Popup>
                    <strong>{point.dfname}</strong> <br />
                    {point.dfaddress} <br />
                    {point.distance.toFixed(2)} km away
                    {point.id === nearestDropOff?.id && <div><b>Nearest Drop-off Point</b></div>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Collectors Section */}
        <div className="col-md-6">
          <h4 className="mb-3">Available Collectors (within 10 km)</h4>
          <div className="d-flex flex-column gap-3">
            {collectors.map((col) => {
              const isSelected = selectedCollectors.find((c) => c.id === col.id);
              return (
                <div
                  key={col.id}
                  className={`card shadow-sm ${isSelected ? "border-success" : ""}`}
                  style={{ cursor: "pointer", transition: "0.3s" }}
                  onClick={() => toggleCollector(col)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">
                        {col.name}{" "}
                        {isSelected && (
                          <span className="badge bg-success ms-2">Selected</span>
                        )}
                      </h5>
                      <span className="text-muted small">
                        {col.distance.toFixed(2)} km away
                      </span>
                    </div>
                    <div className="mt-2">
                      {col.matchingScrapTypes.map((type, idx) => (
                        <span key={idx} className="badge bg-secondary me-1">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <h4 className="mb-3 mt-4">Nearest Drop-off Points</h4>
          <div className="d-flex flex-column gap-3">
            {dropOffPoints.slice(0, 3).map((point) => (
              <div key={point.id} className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-0">{point.dfname}</h5>
                  <span className="text-muted small">
                    {point.distance.toFixed(2)} km away
                  </span>
                </div>
    </div>
  ))}
</div>

      </div>

        <button className="btn btn-lg btn-success w-100 mt-4" onClick={handleRequest}>
          Send Pickup Request(s)
        </button>
      </div>
    </div>
  );
}

export default PickupResult;
