# prepare_household_stats.py
import pandas as pd

# Load dataset
df = pd.read_csv("municipal_waste.csv")

# Compute averages per (City, Waste Type)
stats = df.groupby(["City/District", "Waste Type"]).agg({
    "Waste Generated (Tons/Day)": "mean",
    "Recycling Rate (%)": "mean",
    "Cost of Waste Management (₹/Ton)": "mean"
}).reset_index()

# Save for API
stats.to_csv("household_waste_stats.csv", index=False)
print("Household stats file created!")
