// Create: backend/models/Reminder.js

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true
  },
  timing: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  takenAt: {
    type: Date,
    required: true
  },
  isTaken: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
reminderSchema.index({ medicationId: 1, date: 1, timing: 1 });
reminderSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);