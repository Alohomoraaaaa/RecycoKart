import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";

function PickupResult() {
  const location = useLocation();
  const { scrapType, time, userLat, userLng, address, weight, date, pickupAddress } = location.state;

  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        // 1️⃣ Get all users with role 'collector' and matching address
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "collector"), where("address", "==", address));
        const querySnapshot = await getDocs(q);

        const matchedCollectors = [];

        // 2️⃣ For each matching user, fetch details from collectors/{userId}
        for (const userDoc of querySnapshot.docs) {
          const collectorDocRef = doc(db, "collectors", userDoc.id);
          const collectorSnap = await getDocs(collection(db, "collectors")); // Get all collectors
          const collectorData = collectorSnap.docs.find(d => d.id === userDoc.id)?.data();

          if (collectorData) {
            const hasScrap = collectorData.scrapTypes?.includes(scrapType);
            const start = collectorData.availability?.start;
            const end = collectorData.availability?.end;

            // check if time falls within start-end slot
            const matchesTime = time >= start && time <= end;

            if (hasScrap && matchesTime) {
              matchedCollectors.push({
                id: userDoc.id,
                name: userDoc.data().name,
                lat: collectorData.lat,
                lng: collectorData.lng,
              });
            }
          }
        }

        console.log("Matched Collectors:", matchedCollectors);
        setCollectors(matchedCollectors);

      } catch (err) {
        console.error("Error fetching collectors:", err);
      }
    };

    fetchCollectors();
  }, [scrapType, time, address]);

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

          <Marker position={[userLat, userLng]}>
            <Popup>Your Location</Popup>
          </Marker>

          {collectors.map((col) => (
            <Marker
              key={col.id}
              position={[col.lat, col.lng]}
              eventHandlers={{ click: () => setSelectedCollector(col) }}
            >
              <Popup>{col.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <h4>Matching Collectors</h4>
      <ul className="list-group mb-3">
        {collectors.map((col) => (
          <li
            key={col.id}
            className={`list-group-item ${selectedCollector?.id === col.id ? "active" : ""}`}
            onClick={() => setSelectedCollector(col)}
            style={{ cursor: "pointer" }}
          >
            {col.name}
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
