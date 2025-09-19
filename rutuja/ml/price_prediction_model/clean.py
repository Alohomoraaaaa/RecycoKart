#clean.py
import pandas as pd

# Load raw data
df = pd.read_csv("rutuja/ml/price_prediction_model/weekly_scrap_prices.csv")

# Optional: Convert date column to datetime
if "Date" in df.columns:
    df["Date"] = pd.to_datetime(df["Date"])

# Optional: Remove rows with missing values
df = df.dropna()

# Save cleaned data
df.to_csv("rutuja/ml/price_prediction_model/cleaned_weekly_scrap_prices.csv", index=False)