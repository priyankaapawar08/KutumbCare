const mongoose = require('mongoose');

// Delete old model cache if exists
if (mongoose.models.Appointment) {
  delete mongoose.models.Appointment;
}

const appointmentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  title: { type: String, required: true },
  doctor: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);