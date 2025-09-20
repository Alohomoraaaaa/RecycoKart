import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Pickup() {
  const [scrapTypes, setScrapTypes] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  const navigate = useNavigate();

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

  const handleCheckboxChange = (type) => {
    if (scrapTypes.includes(type)) {
      setScrapTypes(scrapTypes.filter((item) => item !== type));
    } else {
      setScrapTypes([...scrapTypes, type]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (scrapTypes.length === 0) {
      setError("Please select at least one recyclable type");
      return;
    }
    if (!date) {
      setError("Please select a pickup date");
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Pickup date cannot be in the past");
      return;
    }

    if (!time) {
      setError("Please select a pickup time");
      return;
    }
    if (!pickupAddress.trim()) {
      setError("Please enter your full pickup address");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your locality");
      return;
    }

    setError("");

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { address });
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (!data.length) {
        setError("❌ Could not fetch location coordinates for the entered locality.");
        return;
      }
      const { lat, lon } = data[0];

      navigate("/pickupresult", {
        state: {
          scrapTypes,
          date,
          time,
          userLat: parseFloat(lat),
          userLng: parseFloat(lon),
          address,
          pickupAddress,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    }
  };

  return (
    <div className="page-bg">
      <div className="glass-card" style={{ maxWidth: 520, width: "100%", padding: "32px", margin: "32px auto" }}>
        <h2 className="text-center text-success mb-4">Schedule A Scrap Pickup</h2>
        <div className="row justify-content-center">
          <div className="col-md-12">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Recyclable Type (checkboxes) */}
              <div className="mb-3">
                <label className="form-label">Recyclable Type</label>
                <div>
                  {["Plastic", "Paper", "Metal", "E-Waste", "Glass", "Other"].map((type) => (
                    <div key={type} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={type}
                        checked={scrapTypes.includes(type)}
                        onChange={() => handleCheckboxChange(type)}
                      />
                      <label className="form-check-label" htmlFor={type}>
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
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
                />
              </div>

              {/* Locality */}
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
