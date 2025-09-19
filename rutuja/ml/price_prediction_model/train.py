#train.py
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
import joblib

# Load cleaned data
df = pd.read_csv("rutuja/ml/price_prediction_model/cleaned_weekly_scrap_prices.csv")

# Feature engineering
df["Date_ordinal"] = pd.to_datetime(df["Date"]).map(pd.Timestamp.toordinal)
X = df[["Waste_Type", "Date_ordinal"]]
y = df["Price_per_kg"]

# One-hot encode Waste_Type
encoder = OneHotEncoder(sparse_output=False)
X_encoded = encoder.fit_transform(X[["Waste_Type"]])
X_final = pd.concat([
    pd.DataFrame(X_encoded, columns=encoder.get_feature_names_out(["Waste_Type"])),
    X[["Date_ordinal"]].reset_index(drop=True)
], axis=1)

# Train model
model = LinearRegression()
model.fit(X_final, y)

# Save model and encoder
joblib.dump(model, "rutuja/ml/price_prediction_model/price_prediction_model.pkl")
joblib.dump(encoder, "rutuja/ml/price_prediction_model/price_encoder.pkl")