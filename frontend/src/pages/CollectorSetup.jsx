import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

function CollectorSetup() {
  const navigate = useNavigate();
  const [scrapTypes, setScrapTypes] = useState([]);
  const [availability, setAvailability] = useState({ start: "", end: "" });
  const [locality, setLocality] = useState(""); // For users -> address
  const [officeAddress, setOfficeAddress] = useState(""); // For collectors -> officeAddress
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
    if (!locality) {
      setMessage("Please enter your locality.");
      return;
    }
    if (!officeAddress) {
      setMessage("Please enter your complete office address.");
      return;
    }

    try {
      const userId = auth.currentUser.uid;

      // Save locality to users collection (as address)
      await updateDoc(doc(db, "users", userId), {
        address: locality,
      });

      // Get live GPS location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Save to collectors collection
          await updateDoc(doc(db, "collectors", userId), {
            scrapTypes,
            availability,
            officeAddress,
            lat,
            lng: lon,
          });

          setMessage("✅ Collector setup saved with live GPS & office address!");
          navigate("/");
        },
        (error) => {
          console.error("Error getting location:", error);
          setMessage("❌ Please allow location access to complete setup.");
        }
      );
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  };

  return (
    <div className="page-bg">
      <div className="glass-card" style={{ maxWidth: 520, width: "100%", padding: "32px" }}>
        <h2 className="text-center text-success mb-4">Collector Setup</h2>
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

          {/* Locality Text Field */}
          <div className="mb-3">
            <label className="form-label">Locality</label>
            <input
              type="text"
              className="form-control"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="Enter your locality"
              required
            />
          </div>

          {/* Office Address Textarea */}
          <div className="mb-3">
            <label className="form-label">Complete Office Address</label>
            <textarea
              className="form-control"
              rows="3"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="Enter your complete office address"
              required
            ></textarea>
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
  );
}

export default CollectorSetup;
