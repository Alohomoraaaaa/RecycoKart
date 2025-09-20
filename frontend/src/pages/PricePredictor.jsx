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
    <div style={{
      maxWidth: "600px",
      margin: "4rem auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#E9FCDE",
      padding: "2rem",
      borderRadius: "16px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e0e0e0"
    }}>
      <h2 style={{
        textAlign: "center",
        color: "#333",
        fontSize: "2rem",
        marginBottom: "2rem",
        fontWeight: "bold",
        paddingBottom: "10px",
        position: "relative",
      }}>
        💰 Scrap Price Prediction
        <div style={{
          position: "absolute",
          left: "50%",
          bottom: "0",
          transform: "translateX(-50%)",
          width: "80%",
          height: "3px",
          background: "linear-gradient(90deg, #4285F4, #0F9D58, #F4B400, #DB4437)",
          borderRadius: "1.5px",
        }}></div>
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Waste Type Dropdown */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#555" }}>
            Scrap Type:
          </label>
          <select
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              backgroundColor: "#fff",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)"
            }}
          >
            {wasteTypes.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#555" }}>
            Date:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              backgroundColor: "#fff",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)"
            }}
            required
          />
        </div>

        {/* Submit button with gradient border */}
        <div style={{
          position: "relative",
          display: "inline-block",
          width: "100%",
          padding: "2px",
          borderRadius: "50px",
          background: "linear-gradient(45deg, #4285F4, #0F9D58, #F4B400, #DB4437)",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
        }}
        >
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              borderRadius: "50px",
              backgroundColor: "white",
              color: "#333",
              border: "none",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Predict Price
          </button>
        </div>
      </form>

      {/* Show error */}
      {error && <p style={{ color: "#d9534f", marginTop: "1rem", textAlign: "center", fontWeight: "500" }}>{error}</p>}

      {/* Show result */}
      {result && (
        <div style={{
          marginTop: "2.5rem",
          padding: "2rem",
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}>
         
          {result.error ? (
            <p style={{ color: "#d9534f", textAlign: "center", fontWeight: "500" }}>{result.error}</p>
          ) : (
            <div style={{ lineHeight: "1.8", color: "#444", textAlign: "center" }}>
              <p>
                The predicted price for **{result.waste_type}** on **{result.date}** is:
              </p>
              <p style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#0F9D58",
                marginTop: "1rem"
              }}>
                ₹{result.predicted_price_per_kg} per kg
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}