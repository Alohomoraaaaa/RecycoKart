import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function PickupSummary() {
  const location = useLocation();
  const { requestData } = location.state; // passed from dashboard
  const [predictedPrice, setPredictedPrice] = useState(0);
  const [impact, setImpact] = useState({});

  useEffect(() => {
    // Fetch predicted price
    fetch("http://127.0.0.1:5000/predict_price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scrap_type: requestData.scrapType,
        weight: requestData.weight,
      }),
    })
      .then((res) => res.json())
      .then((data) => setPredictedPrice(data.predicted_price));

    // Fetch environmental impact
    fetch("http://127.0.0.1:5000/environmental_impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scrap_type: requestData.scrapType,
        weight: requestData.weight,
      }),
    })
      .then((res) => res.json())
      .then((data) => setImpact(data));
  }, [requestData]);

  return (
    <div className="container my-5">
      <h2 className="text-success mb-4">Pickup Summary</h2>
      <div className="card shadow-sm p-4">
        <p><strong>Scrap Type:</strong> {requestData.scrapType}</p>
        <p><strong>Weight:</strong> {requestData.weight} kg</p>
        <p><strong>Pickup Date:</strong> {requestData.date}</p>
        <p><strong>Pickup Time:</strong> {requestData.time}</p>

        <h5 className="mt-3">Collector Details</h5>
        <p><strong>Name:</strong> {requestData.collectorName}</p>

        <h5 className="mt-3">Predicted Price</h5>
        <p>₹ {predictedPrice}</p>

        <h5 className="mt-3">Environmental Impact</h5>
        <p>CO₂ Saved: {impact.co2_saved} kg</p>
        <p>Water Conserved: {impact.water_conserved} L</p>
        <p>Landfill Diverted: {impact.landfill_diverted} kg</p>
      </div>
    </div>
  );
}

export default PickupSummary;
