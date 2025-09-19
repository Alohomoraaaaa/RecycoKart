from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

# --- Initialize Firebase Admin SDK ---
cred = credentials.Certificate('PrivateKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
CORS(app)  # allow React frontend to communicate

# --- Environmental Impact Dataset ---
environmental_data = {
    "Plastic": {"co2": 2.0, "water": 10.0, "landfill": 1.5},
    "Paper": {"co2": 1.0, "water": 5.0, "landfill": 1.0},
    "Metal": {"co2": 5.0, "water": 2.0, "landfill": 0.5},
    "E-Waste": {"co2": 10.0, "water": 1.0, "landfill": 2.0},
    "Glass": {"co2": 0.5, "water": 1.0, "landfill": 0.2},
    "Other": {"co2": 1.0, "water": 1.0, "landfill": 0.5}
}

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

# --- Endpoint for Multiple Scraps in a Transaction ---
@app.route("/environmental_impact", methods=["POST"])
def environmental_impact():
    data = request.json
    scraps = data.get("scraps")  # Expecting a list of {scrap_type, weight}

    if not scraps or not isinstance(scraps, list):
        return jsonify({"error": "Invalid input. Expected list of scraps."}), 400

    total_impact = {"co2_saved": 0, "water_conserved": 0, "landfill_diverted": 0}

    for item in scraps:
        scrap_type = item.get("scrap_type")
        weight = float(item.get("weight", 0))
        if scrap_type and weight > 0:
            impact = calculate_environmental_impact(scrap_type, weight)
            total_impact["co2_saved"] += impact["co2_saved"]
            total_impact["water_conserved"] += impact["water_conserved"]
            total_impact["landfill_diverted"] += impact["landfill_diverted"]

    # Round totals
    total_impact = {k: round(v, 2) for k, v in total_impact.items()}

    return jsonify(total_impact)

# --- Endpoint for Cumulative Impact per User ---
@app.route("/api/impact/<userId>", methods=["GET"])
def get_user_impact(userId):
    total_co2 = 0
    total_water = 0
    total_landfill = 0
    total_weight = 0

    try:
        requests_ref = db.collection('pickupRequests')
        query_ref = requests_ref.where('userId', '==', userId).where('status', '==', 'completed').stream()

        for doc in query_ref:
            req_data = doc.to_dict()
            scraps = req_data.get("scraps")  # Expecting list of scraps in each request

            if scraps and isinstance(scraps, list):
                for item in scraps:
                    scrap_type = item.get("scrap_type")
                    weight = float(item.get("weight", 0))
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

if __name__ == "__main__":
    app.run(debug=True)
