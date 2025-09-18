from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import firebase_admin
from firebase_admin import credentials, firestore

# --- Initialize Firebase Admin SDK ---
# Replace 'path/to/your/serviceAccountKey.json' with the actual path to your downloaded key file.
# You can get this from your Firebase Project Settings -> Service Accounts.
cred = credentials.Certificate('PrivateKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)  # allow React frontend to communicate

# --- Environmental Impact Dataset ---
# This dictionary acts as your in-memory "dataset"
environmental_data = {
    "Plastic": {"co2": 2.0, "water": 10.0, "landfill": 1.5},
    "Paper": {"co2": 1.0, "water": 5.0, "landfill": 1.0},
    "Metal": {"co2": 5.0, "water": 2.0, "landfill": 0.5},
    "E-Waste": {"co2": 10.0, "water": 1.0, "landfill": 2.0},
    "Glass": {"co2": 0.5, "water": 1.0, "landfill": 0.2},
    "Other": {"co2": 1.0, "water": 1.0, "landfill": 0.5}
}

# --- ML prediction function for scrap price (unchanged) ---
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

# --- Environmental Impact Calculation ---
def calculate_environmental_impact(scrap_type, weight):
    factors = environmental_data.get(scrap_type, environmental_data["Other"])
    co2_saved = factors["co2"] * weight
    water_conserved = factors["water"] * weight
    landfill_diverted = factors["landfill"] * weight

    return {
        "co2_saved": round(co2_saved, 2),
        "water_conserved": round(water_conserved, 2),
        "landfill_diverted": round(landfill_diverted, 2)
    }

# --- 1. Endpoint for a Single Transaction (for PickupSummary.jsx) ---
@app.route("/environmental_impact", methods=["POST"])
def environmental_impact():
    data = request.json
    scrap_type = data.get("scrap_type")
    weight = float(data.get("weight", 0))

    if not scrap_type or weight <= 0:
        return jsonify({"error": "Invalid input"}), 400

    impact = calculate_environmental_impact(scrap_type, weight)
    return jsonify(impact)

# --- 2. Endpoint for Cumulative Impact (for EcoBadges.jsx) ---
@app.route("/api/impact/<userId>", methods=["GET"])
def get_user_impact(userId):
    total_co2 = 0
    total_water = 0
    total_landfill = 0
    total_weight = 0

    try:
        # Query Firestore for all 'completed' requests from the user
        requests_ref = db.collection('pickupRequests')
        query_ref = requests_ref.where('userId', '==', userId).where('status', '==', 'completed').stream()

        for doc in query_ref:
            req_data = doc.to_dict()
            weight = float(req_data.get('weight', 0))
            scrap_type = req_data.get('scrapType')
            
            if scrap_type and weight > 0:
                impact = calculate_environmental_impact(scrap_type, weight)
                total_co2 += impact["co2_saved"]
                total_water += impact["water_conserved"]
                total_landfill += impact["landfill_diverted"]
                total_weight += weight

        return jsonify({
            "co2_saved": round(total_co2, 2),
            "water_conserved": round(total_water, 2),
            "landfill_diverted": round(total_landfill, 2),
            "total_weight": round(total_weight, 2)
        })
    except Exception as e:
        print(f"Error fetching data from Firestore: {e}")
        return jsonify({"error": "Failed to fetch user impact"}), 500
    
@app.route("/predict_price", methods=["POST"])
def predict_price():
    data = request.json
    scrap_type = data.get("scrap_type")
    weight = float(data.get("weight", 0))
    if not scrap_type or weight <= 0:
        return jsonify({"error": "Invalid input"}), 400
    price = predict_scrap_price(scrap_type, weight)
    return jsonify({"predicted_price": price})

if __name__ == "__main__":
    app.run(debug=True)