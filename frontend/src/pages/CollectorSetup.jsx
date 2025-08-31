// src/pages/CollectorSetup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function CollectorSetup() {
  const navigate = useNavigate();
  const [scrapTypes, setScrapTypes] = useState([]);
  const [availability, setAvailability] = useState({ start: "", end: "" });
  const [message, setMessage] = useState("");

  const options = ["Plastic", "Metal", "Paper", "E-Waste", "Glass", "Other"];

  const handleScrapChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setScrapTypes([...scrapTypes, value]);
    } else {
      setScrapTypes(scrapTypes.filter((type) => type !== value));
    }
  };

  const handleAvailabilityChange = (e) => {
    setAvailability({ ...availability, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availability.start || !availability.end) {
      setMessage("Please select availability timings.");
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      // Step 1: Fetch address from users collection
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        setMessage("❌ User address not found.");
        return;
      }
      const { address } = userDoc.data();

      // Step 2: Use OpenStreetMap API to get lat/lng
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      if (!data.length) {
        setMessage("❌ Could not fetch location coordinates.");
        return;
      }
      const { lat, lon } = data[0];

      // Step 3: Save to collectors collection
      await updateDoc(doc(db, "collectors", userId), {
        scrapTypes,
        availability,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
      });

      setMessage("✅ Collector setup saved with location!");
      navigate("/");
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-success mb-4">Collector Setup</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              {/* Scrap Types */}
              <div className="mb-3">
                <label className="form-label">Select Scrap Types You Collect</label>
                <div className="form-check">
                  {options.map((type) => (
                    <div key={type}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        value={type}
                        onChange={handleScrapChange}
                        id={type}
                      />
                      <label className="form-check-label" htmlFor={type}>
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-3">
                <label className="form-label">Availability</label>
                <div className="d-flex gap-2">
                  <input
                    type="time"
                    className="form-control"
                    name="start"
                    value={availability.start}
                    onChange={handleAvailabilityChange}
                    required
                  />
                  <input
                    type="time"
                    className="form-control"
                    name="end"
                    value={availability.end}
                    onChange={handleAvailabilityChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success w-100">
                Save Setup
              </button>
            </form>

            {message && (
              <p
                className={`text-center mt-3 ${
                  message.startsWith("✅") ? "text-success" : "text-danger"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectorSetup;
