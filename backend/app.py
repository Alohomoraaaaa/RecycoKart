from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # allow React frontend to communicate

# --- ML prediction function for scrap price ---
def predict_scrap_price(scrap_type, weight):
    base_prices = {
        "Plastic": 15,
        "Paper": 10,
        "Metal": 50,
        "E-Waste": 100,
        "Glass": 8,
        "Other": 5
    }
    price = base_prices.get(scrap_type, 5) * weight
    
    # Optional: scrap-specific fluctuation
    fluctuation = {"Plastic": 0.05, "Metal": 0.1, "E-Waste": 0.15}.get(scrap_type, 0.05)
    price *= random.uniform(1 - fluctuation, 1 + fluctuation)
    
    return round(price, 2)

@app.route("/predict_price", methods=["POST"])
def predict_price():
    data = request.json
    scrap_type = data.get("scrap_type")
    weight = float(data.get("weight", 0))
    
    if not scrap_type or weight <= 0:
        return jsonify({"error": "Invalid input"}), 400

    price = predict_scrap_price(scrap_type, weight)
    return jsonify({"predicted_price": price})

# --- Environmental Impact Calculation ---
def calculate_environmental_impact(scrap_type, weight):
    impact_factors = {
        "Plastic": {"co2": 2.0, "water": 10.0, "landfill": 1.5},
        "Paper": {"co2": 1.0, "water": 5.0, "landfill": 1.0},
        "Metal": {"co2": 5.0, "water": 2.0, "landfill": 0.5},
        "E-Waste": {"co2": 10.0, "water": 1.0, "landfill": 2.0},
        "Glass": {"co2": 0.5, "water": 1.0, "landfill": 0.2},
        "Other": {"co2": 1.0, "water": 1.0, "landfill": 0.5}
    }

    factors = impact_factors.get(scrap_type, impact_factors["Other"])
    co2_saved = factors["co2"] * weight
    water_conserved = factors["water"] * weight
    landfill_diverted = factors["landfill"] * weight

    return {
        "co2_saved": round(co2_saved, 2),
        "water_conserved": round(water_conserved, 2),
        "landfill_diverted": round(landfill_diverted, 2)
    }

@app.route("/environmental_impact", methods=["POST"])
def environmental_impact():
    data = request.json
    scrap_type = data.get("scrap_type")
    weight = float(data.get("weight", 0))

    if not scrap_type or weight <= 0:
        return jsonify({"error": "Invalid input"}), 400

    impact = calculate_environmental_impact(scrap_type, weight)
    return jsonify(impact)

if __name__ == "__main__":
    app.run(debug=True)
