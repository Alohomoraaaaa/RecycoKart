import pandas as pd
import sys
sys.stdout.reconfigure(encoding='utf-8')
df = pd.read_csv("municipal_waste.csv")
# 🟢 Clean "Cost of Waste Management"
df["Cost of Waste Management (₹/Ton)"] = (
    df["Cost of Waste Management (₹/Ton)"]
    .replace('[₹,]', '', regex=True)   # remove ₹ and commas
    .astype(float)                     # convert to numbers
)
# Split lat/long based on comma
df[["Landfill Lat", "Landfill Long"]] = df["Landfill Location (Lat, Long)"].str.split(",", expand=True)
# Convert to float
df["Landfill Lat"] = df["Landfill Lat"].astype(float)
df["Landfill Long"] = df["Landfill Long"].astype(float)
# Drop old string column
df = df.drop(columns=["Landfill Location (Lat, Long)"])
# Rename cost column
df = df.rename(columns={"Cost of Waste Management (₹/Ton)": "Cost of Waste Management"})
print(df.dtypes)
print(df.head())
# Save cleaned CSV
df.to_csv("cleaned_municipal_waste.csv", index=False)
