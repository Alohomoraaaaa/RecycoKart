# api.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --------------------------
# CORS: Allow frontend
# --------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Load ML Models (Municipal)
# --------------------------
waste_model = joblib.load(open("rutuja/ml/rate/waste_generated_model.pkl", "rb"))
recycling_model = joblib.load(open("rutuja/ml/rate/recycling_rate_model.pkl", "rb"))

# Waste types (from dataset)
WASTE_TYPES = ["Plastic", "Organic", "E-Waste", "Construction", "Hazardous"]

class PredictionInput(BaseModel):
    waste_type: str
    population_density: int
    efficiency_score: int
    awareness_campaigns: int
    cost_of_waste_management: float
    recycling_rate: float        # for waste model
    waste_generated: float       # for recycling model

# --------------------------
# Load Household CSV
# --------------------------
stats = pd.read_csv("rutuja/ml/rate/household_waste_stats.csv")

class HouseholdInput(BaseModel):
    city: str
    waste_type: str

# --------------------------
# Endpoints
# --------------------------
@app.get("/")
def home():
    return {
        "message": "♻️ Unified Waste API is running!",
        "available_endpoints": ["/predict_municipal", "/predict_household"]
    }

# ---- Municipal Prediction ----
@app.post("/predict_municipal")
def predict_municipal(input: PredictionInput):
    # One-hot encoding for waste type
    waste_type_vector = [1 if input.waste_type.lower() == wt.lower() else 0 for wt in WASTE_TYPES]

    features_waste = [
        input.recycling_rate,
        input.population_density,
        input.efficiency_score,
        input.awareness_campaigns,
        input.cost_of_waste_management
    ] + waste_type_vector

    features_recycle = [
        input.waste_generated,
        input.population_density,
        input.efficiency_score,
        input.awareness_campaigns,
        input.cost_of_waste_management
    ] + waste_type_vector

    try:
        waste_generated = waste_model.predict([features_waste])[0]
        recycling_rate = recycling_model.predict([features_recycle])[0]
    except Exception as e:
        return {"error": str(e)}

    return {
        "waste_generated": float(waste_generated),
        "recycling_rate": float(recycling_rate),
        "waste_type_used": input.waste_type
    }

# ---- Household Prediction ----
@app.post("/predict_household")
def predict_household(input: HouseholdInput):
    row = stats[
        (stats["City/District"].str.lower() == input.city.lower()) &
        (stats["Waste Type"].str.lower() == input.waste_type.lower())
    ]

    if row.empty:
        return {"error": "No data for this city/waste type"}

    result = row.iloc[0].to_dict()

    # Estimate per household waste
    households_est = 1_000_000
    per_household_kg = (result["Waste Generated (Tons/Day)"] * 1000) / households_est

    return {
        "city": input.city,
        "waste_type": input.waste_type,
        "expected_waste_per_household_kg_per_day": round(per_household_kg, 2),
        "avg_recycling_rate": round(result["Recycling Rate (%)"], 2),
        "approx_cost_per_ton": round(result["Cost of Waste Management (₹/Ton)"], 2)
    }
