from flask import Flask, request, jsonify
from flask_cors import CORS  # ADD THIS
import pandas as pd
import pickle
import numpy as np
import os

# --- Flask Setup ---
app = Flask(__name__)
CORS(app)  # ADD THIS - Enable CORS for all routes

# --- Define Paths for Model and Encoder ---
MODEL_PATH = os.path.join('models', 'lifestyle_model.pkl')
ENCODER_PATH = os.path.join('models', 'lifestyle_label_encoder.pkl')

# --- Load Model and Label Encoder ---
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(ENCODER_PATH, 'rb') as f:
        le = pickle.load(f)
    print("✅ Model and label encoder loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None
    le = None

# --- Health Check Route ---
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Lifestyle Predictor",
        "model_loaded": model is not None
    })

# --- API Route ---
@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None or le is None:
        return jsonify({"error": "Model not loaded."}), 500

    data = request.json
    sex = data.get('sex')
    diet = data.get('diet')
    activity = data.get('activity')
    addiction = data.get('addiction')

    # Validate input
    if not all([sex, diet, activity, addiction]):
        return jsonify({"error": "All fields are required."}), 400

    # Prepare input DataFrame
    input_df = pd.DataFrame([{
        'Sex': sex,
        'Diet': diet,
        'Physical Activity': activity,
        'Addiction': addiction
    }])

    try:
        # Encode the input using the same encoders used during training
        from sklearn.preprocessing import LabelEncoder
        
        # You need to recreate the encoders or save them during training
        # For now, let's use simple mapping
        sex_map = {'Male': 0, 'Female': 1}
        diet_map = {'Vegetarian': 0, 'Non-Vegetarian': 1, 'Vegan': 2}
        activity_map = {'Low': 0, 'Moderate': 1, 'High': 2}
        addiction_map = {'None': 0, 'Smoking': 1, 'Alcohol': 2}
        
        input_encoded = pd.DataFrame([{
            'Sex': sex_map.get(sex, 0),
            'Diet': diet_map.get(diet, 0),
            'Physical Activity': activity_map.get(activity, 0),
            'Addiction': addiction_map.get(addiction, 0)
        }])

        # Predict class
        pred_num = model.predict(input_encoded)
        pred_label = le.inverse_transform(pred_num)[0]

        # Approximate confidence
        try:
            decision_score = model.decision_function(input_encoded)[0]
            confidence = 1 / (1 + np.exp(-decision_score))
        except:
            # For models without decision_function, use predict_proba
            proba = model.predict_proba(input_encoded)[0]
            confidence = max(proba)

        return jsonify({
            "success": True,
            "prediction": pred_label,
            "confidence": f"{confidence*100:.1f}%"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Prediction failed: {str(e)}"
        }), 500

# --- Run App ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)