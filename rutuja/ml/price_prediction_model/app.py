import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load model and encoder
price_model = joblib.load("rutuja/ml/price_prediction_model/price_prediction_model.pkl")
price_encoder = joblib.load("rutuja/ml/price_prediction_model/price_encoder.pkl")
@app.route("/predict_price", methods=["POST"])
def predict_price():
    data = request.json
    waste_type = data["waste_type"]
    date = pd.to_datetime(data["date"]).toordinal()
    X_encoded = price_encoder.transform([[waste_type]])
    X_final = pd.concat([
        pd.DataFrame(X_encoded, columns=price_encoder.get_feature_names_out(["Waste_Type"])),
        pd.DataFrame([date], columns=["Date_ordinal"])
    ], axis=1)
    price = price_model.predict(X_final)[0]
    return jsonify({"predicted_price_per_kg": round(price, 2)})    
    price_model = joblib.load("rutuja/ml/price_prediction_model/price_prediction_model.pkl")
    price_encoder = joblib.load("rutuja/ml/price_prediction_model/price_encoder.pkl")