# save_models.py
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

# --- Sample Dataset ---
data = {
    "Sex": ["Male", "Female", "Female", "Male", "Female", "Male"],
    "Diet": ["Vegetarian", "Non-Vegetarian", "Vegan", "Vegan", "Vegetarian", "Non-Vegetarian"],
    "Physical Activity": ["High", "Low", "Moderate", "High", "Low", "Moderate"],
    "Addiction": ["None", "Smoking", "Alcohol", "None", "Smoking", "Alcohol"],
    "Lifestyle": ["Healthy", "Unhealthy", "Moderate", "Healthy", "Unhealthy", "Moderate"]
}

df = pd.DataFrame(data)

# --- Encode features ---
feature_cols = ["Sex", "Diet", "Physical Activity", "Addiction"]
X = df[feature_cols].apply(LabelEncoder().fit_transform)

# --- Encode target ---
le = LabelEncoder()
y = le.fit_transform(df["Lifestyle"])  # 0=Healthy, 1=Moderate, 2=Unhealthy

# --- Train model ---
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# --- Save model & label encoder ---
os.makedirs("models", exist_ok=True)
with open("models/lifestyle_model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("models/lifestyle_label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)

print("✅ Model and label encoder saved successfully in 'models/' folder!")
