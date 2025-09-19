import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function PickupSummary() {
  const location = useLocation();
  const { requestData } = location.state; // passed from collector after payment

  const [impact, setImpact] = useState(null); // Environmental impact
  const [collectorAddress, setCollectorAddress] = useState("");

  useEffect(() => {
    // Prepare scraps array to send to Flask
    const scrapsList = requestData.scraps && requestData.scraps.length > 0
      ? requestData.scraps
      : [{ scrap_type: requestData.scrapType, weight: requestData.weight }];

    // Fetch environmental impact
    fetch("http://127.0.0.1:5000/environmental_impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scraps: scrapsList }),
    })
      .then(res => res.json())
      .then(data => setImpact(data))
      .catch(err => console.error("Error fetching impact:", err));

    // Fetch collector's address from Firestore
    const fetchCollectorAddress = async () => {
      try {
        const collectorRef = doc(db, "users", requestData.collectorId);
        const collectorSnap = await getDoc(collectorRef);
        if (collectorSnap.exists()) {
          setCollectorAddress(collectorSnap.data().address);
        }
      } catch (error) {
        console.error("Error fetching collector address:", error);
      }
    };

    fetchCollectorAddress();
  }, [requestData]);

  return (
    <div className="container my-5">
      <h2 className="text-success mb-4">Pickup Summary</h2>
      <div className="card shadow-sm p-4">
        <p><strong>Pickup Date:</strong> {requestData.date}</p>
        <p><strong>Pickup Time:</strong> {requestData.time}</p>

        <h5 className="mt-3">Scrap Details</h5>
        {requestData.scraps && requestData.scraps.length > 0 ? (
          <ul>
            {requestData.scraps.map((item, index) => (
              <li key={index}>
                {item.scrap_type} - {item.weight} kg
              </li>
            ))}
          </ul>
        ) : (
          <p>{requestData.scrapType} - {requestData.weight} kg</p>
        )}

        <h5 className="mt-3">Collector Details</h5>
        <p><strong>Name:</strong> {requestData.collectorName}</p>
        <p><strong>Locality:</strong> {collectorAddress}</p>

        <h5 className="mt-3">Amount Paid</h5>
        <p><strong>Amount Paid:</strong> ₹ {requestData.amount}</p>

        {impact && (
          <div>
            <h5 className="mt-3">🌱 Environmental Impact (Total)</h5>
            <p>CO₂ Saved: {impact.co2_saved} kg</p>
            <p>Water Conserved: {impact.water_conserved} L</p>
            <p>Landfill Diverted: {impact.landfill_diverted} kg</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PickupSummary;
