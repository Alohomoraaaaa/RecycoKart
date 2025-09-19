import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// ✅ Function to dynamically load PayPal SDK
function loadPayPalScript(clientId, currency = "USD") {
  return new Promise((resolve, reject) => {
    // Check if script already exists to prevent duplicates
    if (document.getElementById("paypal-sdk")) {
      // If the currency is different, remove the old script
      if (window.paypal && window.paypal.config.currency !== currency) {
        document.getElementById("paypal-sdk").remove();
      } else {
        resolve(window.paypal);
        return;
      }
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
  const [scraps, setScraps] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  const BASE_PRICES = {
    Plastic: 20,
    "E-Waste": 50,
    Metal: 40,
    Paper: 10,
    Glass: 15,
    Other: 10
  };

  const PAYPAL_CLIENT_ID = "ARFNCBD4t0mi9f6UbljwNv2myef97Foh4VsssMDJDft-oVwHJVocYZJIP4R4h0m2GGUNHMQCIXFQnnWX";

  // ✅ Fetch pickup request and user details
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requestRef = doc(db, "pickupRequests", requestId);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists()) {
          const data = requestSnap.data();
          setRequest({ id: requestSnap.id, ...data });
          
          if (data.userId) {
            const userRef = doc(db, "users", data.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserDetails(userSnap.data());
            } else {
              console.warn("User not found for pickup:", data.userId);
            }
          }
          
          if (Array.isArray(data.scrapTypes) && data.scrapTypes.length > 0) {
            setScraps(data.scrapTypes.map(type => ({ scrap_type: type, weight: 0 })));
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

  // ✅ Auto-calculate total amount
  useEffect(() => {
    const total = scraps.reduce((sum, item) => {
      const price = BASE_PRICES[item.scrap_type] || 10;
      return sum + (parseFloat(item.weight) || 0) * price;
    }, 0);
    setTotalAmount(total.toFixed(2));
  }, [scraps]);

  // ✅ Dynamically render PayPal button
  useEffect(() => {
    if (totalAmount > 0) {
      loadPayPalScript(PAYPAL_CLIENT_ID, "USD")
        .then((paypal) => {
          paypal.Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{ 
                  amount: { 
                    value: totalAmount.toString(),
                    currency_code: "USD" 
                  }
                }],
              });
            },
            onApprove: async (data, actions) => {
              const details = await actions.order.capture();
              console.log("Payment successful:", details);

              // Update Firestore after successful payment
              const requestRef = doc(db, "pickupRequests", requestId);
              await updateDoc(requestRef, {
                scraps: scraps,
                amount: parseFloat(totalAmount),
                status: "completed",
                paymentStatus: "Paid",
                paypalDetails: details // Save payment details for records
              });

              alert("Payment Successful!");
              navigate("/dashboard");
            },
            onError: (err) => {
              console.error("PayPal error:", err);
              alert("Payment failed. Please try again.");
            },
          }).render("#paypal-button-container");
        })
        .catch((err) => console.error("Failed to load PayPal SDK:", err));
    }
  }, [totalAmount, requestId, navigate, scraps]);

  // Handle weight input change
  const handleWeightChange = (index, value) => {
    const newScraps = [...scraps];
    newScraps[index].weight = value; 
    setScraps(newScraps);
  };
  
  // The form submit handler is now for validation only
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!scraps.every(item => parseFloat(item.weight) > 0)) {
      alert("Please enter a valid weight for all scraps.");
    }
    // The PayPal button will handle the rest
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

        <form onSubmit={handleFormSubmit}>
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

          {/* Render PayPal button only if totalAmount is calculated and valid */}
          {totalAmount > 0 ? (
            <div id="paypal-button-container"></div>
          ) : (
            <button type="submit" className="btn btn-success" disabled>
              Enter Weights to Pay
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CompletePickup;