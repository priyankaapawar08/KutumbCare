const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyName: {
    type: String,
    required: [true, 'Family name is required'],
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }]
}, {
  timestamps: true
});

// Ensure a user can only have one family
familySchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Family', familySchema);