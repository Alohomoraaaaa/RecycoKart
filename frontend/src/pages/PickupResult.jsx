import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

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

// Function to calculate distance between two lat/lng (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

function PickupResult() {
  const location = useLocation();
  const { scrapType, time, userLat, userLng, address, weight, date, pickupAddress } = location.state;

  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "collector"));
        const querySnapshot = await getDocs(q);

        const matchedCollectors = [];

        for (const userDoc of querySnapshot.docs) {
          const collectorSnap = await getDocs(collection(db, "collectors"));
          const collectorData = collectorSnap.docs.find(d => d.id === userDoc.id)?.data();

          if (collectorData) {
            const hasScrap = collectorData.scrapTypes?.includes(scrapType);
            const start = collectorData.availability?.start;
            const end = collectorData.availability?.end;
            const matchesTime = time >= start && time <= end;

            if (hasScrap && matchesTime) {
              const distance = getDistance(userLat, userLng, collectorData.lat, collectorData.lng);

              // ✅ Radius filter (e.g., 10 km)
              if (distance <= 10) {
                matchedCollectors.push({
                  id: userDoc.id,
                  name: userDoc.data().name,
                  lat: collectorData.lat,
                  lng: collectorData.lng,
                  distance,
                });
              }
            }
          }
        }

        // Sort collectors by distance (nearest first)
        matchedCollectors.sort((a, b) => a.distance - b.distance);

        console.log("Matched Collectors:", matchedCollectors);
        setCollectors(matchedCollectors);

      } catch (err) {
        console.error("Error fetching collectors:", err);
      }
    };

    fetchCollectors();
  }, [scrapType, time, userLat, userLng]);

  const handleRequest = async () => {
    if (!selectedCollector) return alert("Please select a collector!");

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to send a request.");
      return;
    }

    const requestRef = doc(db, "pickupRequests", `${Date.now()}`);
    await setDoc(requestRef, {
      userId: user.uid,
      collectorId: selectedCollector.id,
      collectorName: selectedCollector.name,
      scrapType,
      weight,
      date,
      time,
      status: "pending",
      userLat,
      userLng,
      pickupAddress,
    });

    alert(`Request sent to ${selectedCollector.name}!`);
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Select A Collector</h2>

      <div style={{ height: "400px", marginBottom: "20px" }}>
        <MapContainer center={[userLat, userLng]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User marker in blue */}
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>

          {/* Collectors in red */}
          {collectors.map((col) => (
            <Marker
              key={col.id}
              position={[col.lat, col.lng]}
              icon={collectorIcon}
              eventHandlers={{ click: () => setSelectedCollector(col) }}
            >
              <Popup>{col.name} <br /> {col.distance.toFixed(2)} km away</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <h4>Nearest Collectors (within 10 km)</h4>
      <ul className="list-group mb-3">
        {collectors.map((col) => (
          <li
            key={col.id}
            className={`list-group-item ${selectedCollector?.id === col.id ? "active" : ""}`}
            onClick={() => setSelectedCollector(col)}
            style={{ cursor: "pointer" }}
          >
            {col.name} — {col.distance.toFixed(2)} km away
          </li>
        ))}
      </ul>

      <button className="btn btn-success w-100" onClick={handleRequest}>
        Send Pickup Request
      </button>
    </div>
  );
}

export default PickupResult;
