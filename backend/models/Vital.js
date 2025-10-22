const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vitalType: {
    type: String,
    required: [true, 'Vital type is required'],
    enum: ['blood_pressure', 'blood_sugar', 'temperature', 'weight', 'height', 'heart_rate', 'oxygen_level', 'bmi', 'respiratory_rate']
  },
  value: {
    systolic: Number,      // for blood pressure
    diastolic: Number,     // for blood pressure
    measurement: Number,   // for single value vitals
    unit: String          // kg, °F, °C, bpm, %, mg/dL, etc.
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  time: {
    type: String,  // Format: "HH:MM"
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: String,
    default: 'self'
  }
}, {
  timestamps: true
});

// Index for faster queries
vitalSchema.index({ memberId: 1, vitalType: 1, date: -1 });

module.exports = mongoose.model('Vital', vitalSchema);