const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  documentType: {
    type: String,
    enum: ['lab_report', 'prescription', 'xray', 'scan', 'insurance', 'bill', 'other'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  documentDate: {
    type: Date
  },
  tags: [{
    type: String
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

documentSchema.index({ memberId: 1, uploadDate: -1 });
documentSchema.index({ familyId: 1 });

module.exports = mongoose.model('Document', documentSchema);