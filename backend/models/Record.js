const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
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
  recordType: {
    type: String,
    required: true,
    enum: ['appointment', 'lab_report', 'prescription', 'vaccination', 'surgery', 'diagnosis', 'other']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // For Appointments
  appointmentDate: {
    type: Date
  },
  appointmentTime: {
    type: String
  },
  doctorName: {
    type: String,
    trim: true
  },
  specialty: {
    type: String,
    trim: true
  },
  hospitalClinic: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  // For Reports/Documents
  documentUrl: {
    type: String
  },
  documentType: {
    type: String,
    enum: ['pdf', 'image', 'other']
  },
  // General
  date: {
    type: Date,
    default: Date.now
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for appointments
recordSchema.index({ memberId: 1, recordType: 1, appointmentDate: 1 });

module.exports = mongoose.model('Record', recordSchema);