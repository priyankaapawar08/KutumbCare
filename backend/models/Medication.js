const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
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
  medicationName: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'weekly', 'monthly']
  },
  timing: [{
    type: String,
    // ✅ UPDATED: Now accepts actual times like "08:00", "14:00", "20:00"
    // Removed enum restriction
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  prescribedBy: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  reminderEnabled: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for active medications
medicationSchema.index({ memberId: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);