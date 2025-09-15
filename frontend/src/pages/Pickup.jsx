import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Pickup() {
  const [scrapType, setScrapType] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState(""); // store user's locality (address in DB)
  const [pickupAddress, setPickupAddress] = useState("");

  const navigate = useNavigate();

  // Fetch logged-in user's address/locality from Firestore
  useEffect(() => {
    const fetchUserAddress = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setAddress(userDoc.data().address || "");
      }
    };
    fetchUserAddress();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scrapType) { setError("Please select a recyclable type"); return; }
    if (weight <= 0) { setError("Weight must be greater than 0 kg"); return; }
    if (!date) { setError("Please select a pickup date"); return; }

    const selectedDate = new Date(date);
    const today = new Date(); 
    today.setHours(0,0,0,0);
    if (selectedDate < today) { setError("Pickup date cannot be in the past"); return; }

    if (!time) { setError("Please select a pickup time"); return; }
    if (!pickupAddress.trim()) { 
      setError("Please enter your full pickup address"); 
      return; 
    }

    setError("");

    try {
      const user = auth.currentUser;
      if (user) {
        // ✅ Save locality into Firestore under "address"
        await updateDoc(doc(db, "users", user.uid), {
          address: address,
        });
      }

      // Get user location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Navigate to PickupResult
          navigate("/pickupresult", {
            state: {
              scrapType,
              weight,
              date,
              time,
              userLat,
              userLng,
              address, // from state
              pickupAddress,
            },
          });
        },
        () => {
          setError("Unable to fetch location. Please enable GPS.");
        }
      );
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Schedule A Scrap Pickup</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Recyclable Type */}
              <div className="mb-3">
                <label className="form-label">Recyclable Type</label>
                <select
                  className="form-select"
                  value={scrapType}
                  onChange={(e) => setScrapType(e.target.value)}
                >
                  <option value="">-- Select Type --</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Paper">Paper</option>
                  <option value="Metal">Metal</option>
                  <option value="E-Waste">E-Waste</option>
                  <option value="Glass">Glass</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Weight */}
              <div className="mb-3">
                <label className="form-label">Approx. Weight (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              {/* Pickup Date */}
              <div className="mb-3">
                <label className="form-label">Preferred Pickup Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Pickup Time */}
              <div className="mb-3">
                <label className="form-label">Preferred Pickup Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              {/* Pickup Address */}
              <div className="mb-3">
                <label className="form-label">Pickup Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter your full pickup address"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                ></textarea>
              </div>

              {/* Locality (UI word) */}
              <div className="mb-3">
                <label className="form-label">Locality</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your locality"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100">
                Schedule Pickup
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pickup;
