import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function CompletePickup() {
  const { requestId } = useParams(); // pickup request id passed via route
  const [request, setRequest] = useState(null);
  const [weight, setWeight] = useState("");
  const [amount, setAmount] = useState(0);
  const navigate = useNavigate();

  // ✅ Base prices per waste type (example rates, you can change them)
  const BASE_PRICES = {
    "Plastic": 20,  // ₹20 per kg
    "E-Waste": 50,  // ₹50 per kg
    "Metal": 40,    // ₹40 per kg
    "Paper": 10,    // ₹10 per kg
    "Glass": 15     // ₹15 per kg
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requestRef = doc(db, "pickupRequests", requestId);
        const requestSnap = await getDoc(requestRef);
        if (requestSnap.exists()) {
          setRequest({ id: requestSnap.id, ...requestSnap.data() });
        } else {
          alert("Request not found");
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching request:", err);
      }
    };

    fetchRequest();
  }, [requestId, navigate]);

  // ✅ Auto-calculate amount when weight changes
  useEffect(() => {
    if (request && weight) {
      const basePrice = BASE_PRICES[request.scrapType] || 10; // fallback ₹10/kg
      setAmount((parseFloat(weight) * basePrice).toFixed(2));
    }
  }, [weight, request]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!weight) {
      alert("Please enter weight");
      return;
    }

    try {
      const requestRef = doc(db, "pickupRequests", requestId);
      await updateDoc(requestRef, {
        weight: parseFloat(weight),
        amount: parseFloat(amount),
        status: "completed", // ✅ only completed counts for stats
      });

      alert("Pickup completed successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating pickup:", err);
      alert("Error updating pickup");
    }
  };

  if (!request) return <p className="text-center mt-5">Loading pickup...</p>;

  return (
    <div className="container my-5">
      <h2 className="text-success mb-4">Complete Pickup</h2>
      <div className="card shadow p-4">
        <h5>{request.scrapType} Pickup</h5>
        <p><strong>Date:</strong> {request.date}</p>
        <p><strong>Time:</strong> {request.time}</p>
        <p><strong>User Address:</strong> {request.pickupAddress}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Weight (kg)</label>
            <input
              type="number"
              className="form-control"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              min="0"
              step="0.1"
            />
          </div>

          {/* ✅ Auto-calculated amount shown here */}
          <div className="mb-3">
            <label className="form-label">Calculated Amount (₹)</label>
            <input
              type="text"
              className="form-control"
              value={amount}
              disabled
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            Complete Pickup
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompletePickup;