import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// ✅ Function to dynamically load PayPal SDK
function loadPayPalScript(clientId, currency = "USD") {
  return new Promise((resolve, reject) => {
    if (document.getElementById("paypal-sdk")) {
      resolve(window.paypal);
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    script.onload = () => resolve(window.paypal);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

function CompletePickup() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [weight, setWeight] = useState("");
  const [amount, setAmount] = useState(0);
  const navigate = useNavigate();

  // ✅ Base prices per scrap type
  const BASE_PRICES = {
    "Plastic": 20,
    "E-Waste": 50,
    "Metal": 40,
    "Paper": 10,
    "Glass": 15
  };

  const PAYPAL_CLIENT_ID = "ARFNCBD4t0mi9f6UbljwNv2myef97Foh4VsssMDJDft-oVwHJVocYZJIP4R4h0m2GGUNHMQCIXFQnnWX"; // Replace with sandbox ID

  // ✅ Fetch pickup request from Firestore
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

  // ✅ Auto-calculate amount
  useEffect(() => {
    if (request && weight) {
      const basePrice = BASE_PRICES[request.scrapType] || 10;
      setAmount((parseFloat(weight) * basePrice).toFixed(2));
    }
  }, [weight, request]);

  // ✅ Render PayPal button dynamically when amount is ready
  useEffect(() => {
    if (amount > 0) {
      loadPayPalScript(PAYPAL_CLIENT_ID)
        .then((paypal) => {
          paypal.Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{ amount: { value: amount.toString() } }],
              });
            },
            onApprove: async (data, actions) => {
              const details = await actions.order.capture();
              console.log("Payment successful:", details);

              // Update Firestore: pickup completed + payment done
              const requestRef = doc(db, "pickupRequests", requestId);
              await updateDoc(requestRef, {
                weight: parseFloat(weight),
                amount: parseFloat(amount),
                status: "completed",
                paymentStatus: "Paid",
              });

              alert("Payment Successful!");
              navigate("/dashboard");
            },
            onError: (err) => {
            console.error("PayPal error:", JSON.stringify(err));
            alert("Payment failed: " + err.message);
          },
          }).render("#paypal-button-container");
        })
        .catch((err) => console.error("Failed to load PayPal SDK:", err));
    }
  }, [amount, requestId, navigate, weight]);

  if (!request) return <p className="text-center mt-5">Loading pickup...</p>;

  return (
    <div className="container my-5">
      <h2 className="text-success mb-4">Complete Pickup</h2>
      <div className="card shadow p-4">
        <h5>{request.scrapType} Pickup</h5>
        <p><strong>Date:</strong> {request.date}</p>
        <p><strong>Time:</strong> {request.time}</p>
        <p><strong>User Address:</strong> {request.pickupAddress}</p>

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

        <div className="mb-3">
          <label className="form-label">Calculated Amount (₹)</label>
          <input
            type="text"
            className="form-control"
            value={amount}
            disabled
          />
        </div>

        {/* ✅ PayPal Button Container */}
        {amount > 0 && <div id="paypal-button-container"></div>}
      </div>
    </div>
  );
}

export default CompletePickup;
