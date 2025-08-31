import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const CollectorMap = ({ userLocation }) => {
  const [collector, setCollector] = useState(null);

useEffect(() => {
  if (userLocation) {
    fetch("http://127.0.0.1:5000/nearest-collector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userLocation),
    })
      .then((res) => res.json())
      .then((data) => {
        // get top 1 (nearest) collector
        if (data.collectors && data.collectors.length > 0) {
          setCollector(data.collectors[0]);
        }
      });
  }
}, [userLocation]);

  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    iconSize: [35, 35],
  });

  const collectorIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [35, 35],
  });

  return (
    <div className="my-4">
      <h5 className="mb-3">Pickup Location & Assigned Collector</h5>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={5}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {collector && (
          <Marker position={[collector.lat, collector.lng]} icon={collectorIcon}>
            <Popup>
              <b>{collector.name}</b>
              <br />
              Distance: {collector.distance} km
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default CollectorMap;
