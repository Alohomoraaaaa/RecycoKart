# RecycoKart/rutuja/api.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# --------------------------
# FastAPI app
# --------------------------
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
# Load ML Models
# --------------------------
waste_model = joblib.load("rutuja/ml/rate/waste_generated_model.pkl")
recycling_model = joblib.load("rutuja/ml/rate/recycling_rate_model.pkl")

price_model = joblib.load("rutuja/ml/price_prediction_model/price_prediction_model.pkl")
price_encoder = joblib.load("rutuja/ml/price_prediction_model/price_encoder.pkl")
price_df = pd.read_csv("rutuja/ml/price_prediction_model/cleaned_weekly_scrap_prices.csv")

# --------------------------
# Constants
# --------------------------
WASTE_TYPES = ["Plastic", "Organic", "E-Waste", "Construction", "Hazardous"]

# --------------------------
# Schemas
# --------------------------
class PredictionInput(BaseModel):
    waste_type: str
    population_density: int
    efficiency_score: int
    awareness_campaigns: int
    cost_of_waste_management: float
    recycling_rate: float        # for waste model
    waste_generated: float       # for recycling model

class HouseholdInput(BaseModel):
    city: str
    waste_type: str

class PriceInput(BaseModel):
    waste_type: str
    date: str  # YYYY-MM-DD

# --------------------------
# Load Household CSV
# --------------------------
stats = pd.read_csv("rutuja/ml/rate/household_waste_stats.csv")

# --------------------------
# Endpoints
# --------------------------
@app.get("/")
def home():
    return {
        "message": "♻️ Unified Waste API is running!",
        "available_endpoints": [
            "/predict_municipal",
            "/predict_household",
            "/predict_price",
            "/price_history"
        ]
    }

# ---- Municipal Prediction ----
@app.post("/predict_municipal")
def predict_municipal(input: PredictionInput):
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

    households_est = 1_000_000
    per_household_kg = (result["Waste Generated (Tons/Day)"] * 1000) / households_est

    return {
        "city": input.city,
        "waste_type": input.waste_type,
        "expected_waste_per_household_kg_per_day": round(per_household_kg, 2),
        "avg_recycling_rate": round(result["Recycling Rate (%)"], 2),
        "approx_cost_per_ton": round(result["Cost of Waste Management (₹/Ton)"], 2)
    }

# ---- Scrap Price Prediction ----
@app.post("/predict_price")
def predict_price(input: PriceInput):
    try:
        date = pd.to_datetime(input.date).toordinal()
    except Exception:
        return {"error": "Invalid date format. Use YYYY-MM-DD."}

    try:
        X_encoded = price_encoder.transform([[input.waste_type]])
        X_final = pd.concat([
            pd.DataFrame(X_encoded, columns=price_encoder.get_feature_names_out(["Waste_Type"])),
            pd.DataFrame([date], columns=["Date_ordinal"])
        ], axis=1)

        price = price_model.predict(X_final)[0]
        return {
            "waste_type": input.waste_type,
            "date": input.date,
            "predicted_price_per_kg": round(price, 2)
        }
    except Exception as e:
        return {"error": str(e)}

# ---- Price History ----
@app.get("/price_history")
def price_history(waste_type: str, start_date: str, end_date: str):
    try:
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
    except Exception:
        return {"error": "Invalid date format. Use YYYY-MM-DD."}

    filtered = price_df[
        (price_df["Waste_Type"].str.lower() == waste_type.lower()) &
        (pd.to_datetime(price_df["Date"]) >= start) &
        (pd.to_datetime(price_df["Date"]) <= end)
    ]

    if filtered.empty:
        return []

    return filtered.to_dict(orient="records")
