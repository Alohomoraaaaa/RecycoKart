#train.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

# Load cleaned data
df = pd.read_csv("rutuja/ml/rate/cleaned_municipal_waste.csv")

# ------------------------
# Encode Waste Type
# ------------------------
df_encoded = pd.get_dummies(df, columns=["Waste Type"], drop_first=False)

# ------------------------
# 1. Predict Waste Generated
# ------------------------
X_waste = df_encoded[[
    "Recycling Rate (%)",
    "Population Density (People/km²)",
    "Municipal Efficiency Score (1-10)",
    "Awareness Campaigns Count",
    "Cost of Waste Management"
] + [col for col in df_encoded.columns if col.startswith("Waste Type_")]]

y_waste = df["Waste Generated (Tons/Day)"]

X_train_waste, X_test_waste, y_train_waste, y_test_waste = train_test_split(
    X_waste, y_waste, test_size=0.2, random_state=42
)

model_waste = LinearRegression()
model_waste.fit(X_train_waste, y_train_waste)

# Save model
joblib.dump(model_waste, "rutuja/ml/rate/waste_generated_model.pkl")

# ------------------------
# 2. Predict Recycling Rate
# ------------------------
X_recycle = df_encoded[[
    "Waste Generated (Tons/Day)",
    "Population Density (People/km²)",
    "Municipal Efficiency Score (1-10)",
    "Awareness Campaigns Count",
    "Cost of Waste Management"
] + [col for col in df_encoded.columns if col.startswith("Waste Type_")]]

y_recycle = df["Recycling Rate (%)"]

X_train_recycle, X_test_recycle, y_train_recycle, y_test_recycle = train_test_split(
    X_recycle, y_recycle, test_size=0.2, random_state=42
)

model_recycle = LinearRegression()
model_recycle.fit(X_train_recycle, y_train_recycle)

# Save model
joblib.dump(model_recycle, "rutuja/ml/rate/recycling_rate_model.pkl")

print("Models trained and saved with Waste Type included!")

# ------------------------
# Evaluate Accuracy
# ------------------------
waste_accuracy = model_waste.score(X_test_waste, y_test_waste)
print("Waste Model R² Score:", waste_accuracy)

recycle_accuracy = model_recycle.score(X_test_recycle, y_test_recycle)
print("Recycling Model R² Score:", recycle_accuracy)
