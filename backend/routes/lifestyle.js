const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Predict lifestyle (no auth for now - for testing)
router.post('/predict', async (req, res) => {
  try {
    const { sex, diet, activity, addiction } = req.body;

    if (!sex || !diet || !activity || !addiction) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    console.log('🟡 Calling ML service with:', { sex, diet, activity, addiction });

    // Call Python ML service
    const response = await axios.post(`${ML_SERVICE_URL}/api/predict`, {
      sex,
      diet,
      activity,
      addiction
    });

    console.log('✅ ML service response:', response.data);

    res.json(response.data);

  } catch (error) {
    console.error('❌ ML Service Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Prediction service unavailable: ' + error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ML service is down'
    });
  }
});

module.exports = router;