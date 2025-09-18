# train_municipal.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

# Load dataset
df = pd.read_csv("rutuja/ml/rate/municipal_waste.csv")

# One-hot encode categorical columns
df_encoded = pd.get_dummies(df, columns=["Waste Type"], drop_first=False)

# ------------------------
# Model 1: Predict Waste Generated
# ------------------------
X_waste = df_encoded[[
    "Recycling Rate (%)",
    "Population Density (People/km²)",
    "Municipal Efficiency Score (1-10)",
    "Awareness Campaigns Count",
    "Cost of Waste Management (₹/Ton)"
] + [c for c in df_encoded.columns if c.startswith("Waste Type_")]]
y_waste = df["Waste Generated (Tons/Day)"]

X_train, X_test, y_train, y_test = train_test_split(X_waste, y_waste, test_size=0.2, random_state=42)

model_waste = LinearRegression().fit(X_train, y_train)
joblib.dump(model_waste, "waste_generated_model.pkl")
print("Waste Model R²:", model_waste.score(X_test, y_test))

# ------------------------
# Model 2: Predict Recycling Rate
# ------------------------
X_recycle = df_encoded[[
    "Population Density (People/km²)",
    "Municipal Efficiency Score (1-10)",
    "Awareness Campaigns Count",
    "Cost of Waste Management (₹/Ton)"
] + [c for c in df_encoded.columns if c.startswith("Waste Type_")]]
y_recycle = df["Recycling Rate (%)"]

X_train, X_test, y_train, y_test = train_test_split(X_recycle, y_recycle, test_size=0.2, random_state=42)

model_recycle = LinearRegression().fit(X_train, y_train)
joblib.dump(model_recycle, "rutuja/ml/rate/recycling_rate_model.pkl")
print("Recycling Model R²:", model_recycle.score(X_test, y_test))

print("Municipal Models trained & saved!")
