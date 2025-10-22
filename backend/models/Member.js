const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: false  // ← CHANGE TO FALSE
  },
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age must be positive']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  relation: {
    type: String,
    required: [true, 'Relation is required'],
    enum: ['self', 'father', 'mother', 'son', 'daughter', 'brother', 'sister', 'spouse', 'grandfather', 'grandmother', 'other']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown'
  },
  allergies: [{
    type: String,
    trim: true
  }],
  chronicConditions: [{
    type: String,
    trim: true
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  profileImage: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);