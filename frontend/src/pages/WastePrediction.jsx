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
        // The new gradient line style
        borderBottom: "none", // Remove the old border
        position: "relative",
      }}>
        ♻️ Waste Prediction
        <div style={{
          position: "absolute",
          left: "50%",
          bottom: "0",
          transform: "translateX(-50%)",
          width: "80%", // Adjust width as needed
          height: "3px", // Line thickness
          background: "linear-gradient(90deg, #4285F4, #0F9D58, #F4B400, #DB4437)",
          borderRadius: "1.5px", // To make the line ends rounded
        }}></div>
      </h2>

      <form onSubmit={handleSubmit}>
        {/* City Dropdown */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#555" }}>
            City:
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Garbage Type Dropdown */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#555" }}>
            Garbage Type:
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

        {/* This div acts as the container for the gradient border */}
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
              borderRadius: "50px", // Match parent's border radius
              backgroundColor: "white", // Inner button color
              color: "#333",
              border: "none", // Remove default button border
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // Important: The transition and hover effects are now on the parent div
            }}
          >
            Predict
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
          <h3 style={{
            textAlign: "center",
            color: "#333",
            fontSize: "1.5rem",
            marginBottom: "1rem",
            borderBottom: "1px dashed #ccc",
            paddingBottom: "10px"
          }}>
            Prediction Result:
          </h3>
          {result.error ? (
            <p style={{ color: "#d9534f", textAlign: "center", fontWeight: "500" }}>{result.error}</p>
          ) : (
            <div style={{ lineHeight: "1.8", color: "#444" }}>
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