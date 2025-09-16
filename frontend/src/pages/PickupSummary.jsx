import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function PickupSummary() {
  const location = useLocation();
  const { requestData } = location.state; // passed from collector after payment

  const [predictedPrice, setPredictedPrice] = useState(0);
  const [impact, setImpact] = useState({});
  const [collectorAddress, setCollectorAddress] = useState("");

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

    // Fetch collector's address from users collection
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
        <p><strong>Scrap Type:</strong> {requestData.scrapType}</p>
        <p><strong>Weight:</strong> {requestData.weight} kg</p>
        <p><strong>Pickup Date:</strong> {requestData.date}</p>
        <p><strong>Pickup Time:</strong> {requestData.time}</p>

        <h5 className="mt-3">Collector Details</h5>
        <p><strong>Name:</strong> {requestData.collectorName}</p>
        <p><strong>Locality:</strong> {collectorAddress}</p>

        <h5 className="mt-3">Amount Paid</h5>
        <p><strong>Amount Paid:</strong> ₹ {requestData.amount}</p>

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
