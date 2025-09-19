//PricePredictor.jsx
import React, { useState } from "react";

export default function PricePredictor() {
  const [wasteType, setWasteType] = useState("Plastic");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Waste types (should match your model)
  const wasteTypes = ["Plastic", "Paper", "Metal", "E-Waste", "Glass", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict_price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waste_type: wasteType, date }),
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
      <h2>💰 Scrap Price Prediction</h2>

      <form onSubmit={handleSubmit}>
        {/* Waste Type Dropdown */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Scrap Type: </label>
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

        {/* Date Picker */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Date: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        <button type="submit" style={{ padding: "10px 20px" }}>
          Predict Price
        </button>
      </form>

      {/* Show error */}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {/* Show result */}
      {result && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
          {result.error ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <div>
              <p>
                The predicted price for <strong>{result.waste_type}</strong> on <strong>{result.date}</strong> is:
              </p>
              <p>
                <strong>₹{result.predicted_price_per_kg} per kg</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}