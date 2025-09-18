// WastePredictor.js
import React, { useState } from "react";

export default function WastePredictor() {
  const [city, setCity] = useState("Agra"); // default (first alphabetically)
  const [wasteType, setWasteType] = useState("Plastic");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // List of cities (sorted alphabetically)
  const cities = [
    "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
    "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Kanpur",
    "Nagpur", "Patna", "Bhopal", "Thiruvananthapuram", "Indore",
    "Vadodara", "Guwahati", "Coimbatore", "Ranchi", "Amritsar",
    "Jodhpur", "Varanasi", "Ludhiana", "Agra", "Meerut", "Nashik",
    "Rajkot", "Madurai", "Jabalpur", "Allahabad", "Visakhapatnam",
    "Gwalior"
  ].sort();

  // List of waste types from dataset
  const wasteTypes = ["Plastic", "Organic", "E-Waste", "Construction", "Hazardous"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict_household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, waste_type: wasteType }),
      });

      if (!response.ok) throw new Error("Server error: " + response.status);

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to fetch data. Make sure FastAPI is running on port 8000.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>♻️ Waste Prediction</h2>

      <form onSubmit={handleSubmit}>
        {/* City Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label>City: </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Garbage Type Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Garbage Type: </label>
          <select
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            {wasteTypes.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ padding: "10px 20px" }}>
          Predict
        </button>
      </form>

      {/* Show error */}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {/* Show result */}
      {result && (
  <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
    <h3>Prediction Result:</h3>
    {result.error ? (
      <p style={{ color: "red" }}>{result.error}</p>
    ) : (
      <div>
        <p>
          Hey, based on your city <strong>{result.city}</strong> and waste type{" "}
          <strong>{result.waste_type}</strong>:
        </p>
        <p>
          🗑️ Your household generates around{" "}
          <strong>{result.expected_waste_per_household_kg_per_day} kg/day</strong>{" "}
          of {result.waste_type.toLowerCase()} waste.
        </p>
        <p>
          ♻️ The average recycling rate in {result.city} is{" "}
          <strong>{result.avg_recycling_rate}%</strong>.
        </p>
        <p>
          💰 The approximate cost of managing this waste is about{" "}
          <strong>₹{result.approx_cost_per_ton} per ton</strong>.
        </p>
      </div>
    )}
  </div>
)}

    </div>
  );
}
