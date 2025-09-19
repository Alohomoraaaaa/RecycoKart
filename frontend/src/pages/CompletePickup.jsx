import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function CompletePickup() {
  const { requestId } = useParams(); // pickup request id
  const [request, setRequest] = useState(null);
  const [scraps, setScraps] = useState([]); // array of { scrap_type, weight }
  const [totalAmount, setTotalAmount] = useState(0);
  const [userDetails, setUserDetails] = useState(null); // NEW: for user data
  const navigate = useNavigate();

  // Base prices per scrap type
  const BASE_PRICES = {
    Plastic: 20,
    "E-Waste": 50,
    Metal: 40,
    Paper: 10,
    Glass: 15,
    Other: 10
  };

  // Fetch pickup request + user info
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requestRef = doc(db, "pickupRequests", requestId);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists()) {
          const data = requestSnap.data();
          setRequest({ id: requestSnap.id, ...data });

          // Fetch user details from users collection
          if (data.userId) {
            const userRef = doc(db, "users", data.userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              setUserDetails(userSnap.data());
            } else {
              console.warn("User not found for pickup:", data.userId);
            }
          }

          // Initialize scraps array from scrapTypes array
          if (Array.isArray(data.scrapTypes) && data.scrapTypes.length > 0) {
            setScraps(
              data.scrapTypes.map((type) => ({
                scrap_type: type,
                weight: 0 // default weight
              }))
            );
          } else {
            alert("No scrap types found for this request.");
            navigate("/dashboard");
          }
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

  // Auto-calculate total amount whenever scraps change
  useEffect(() => {
    const total = scraps.reduce((sum, item) => {
      const price = BASE_PRICES[item.scrap_type] || 10;
      return sum + item.weight * price;
    }, 0);
    setTotalAmount(total.toFixed(2));
  }, [scraps]);

  // Handle weight input change
  const handleWeightChange = (index, value) => {
    const newScraps = [...scraps];
    newScraps[index].weight = parseFloat(value) || 0;
    setScraps(newScraps);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scraps.every((item) => item.weight > 0)) {
      alert("Please enter weight for all scraps");
      return;
    }

    try {
      const requestRef = doc(db, "pickupRequests", requestId);
      await updateDoc(requestRef, {
        scraps: scraps,
        amount: parseFloat(totalAmount),
        status: "completed"
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
        <h5>Pickup Details</h5>
        <p><strong>Date:</strong> {request.date}</p>
        <p><strong>Time:</strong> {request.time}</p>
        <p><strong>User Address:</strong> {request.pickupAddress}</p>

        {userDetails && (
          <>
            <p><strong>User Name:</strong> {userDetails.name}</p>
            <p>
              <strong>Contact:</strong>{" "}
              <a href={`tel:${userDetails.contact}`} className="text-primary text-decoration-none">
                {userDetails.contact}
              </a>
            </p>

          </>
        )}

        <form onSubmit={handleSubmit}>
          <h5 className="mt-3">Scrap Details</h5>
          {scraps.map((item, index) => (
            <div className="mb-3" key={index}>
              <label className="form-label">{item.scrap_type} (kg)</label>
              <input
                type="number"
                className="form-control"
                value={item.weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
                min="0"
                step="0.1"
                placeholder={`Enter weight for ${item.scrap_type}`}
                required
              />
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label">Total Amount (₹)</label>
            <input type="text" className="form-control" value={totalAmount} disabled />
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
