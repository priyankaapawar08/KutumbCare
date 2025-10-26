const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { protect } = require('../middleware/auth'); // CHANGED
const multer = require('multer');
const path = require('path');

// Simple memory storage for now
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOC, and DOCX are allowed.'));
    }
  }
});

// Upload document
router.post('/upload', protect, upload.single('document'), async (req, res) => {
  try {
    console.log('🟡 [DOCUMENTS] req.user:', req.user);
    console.log('🟡 [DOCUMENTS] req.body:', req.body);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { memberId, title, description, documentType, documentDate, tags } = req.body;

    if (!memberId || !title || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Member ID, title, and document type are required'
      });
    }

    // Get familyId from user object or from member
    let familyId = req.user.familyId;
    
    if (!familyId) {
      // If user doesn't have familyId, get it from the member
      const FamilyMember = require('../models/FamilyMember');
      const member = await FamilyMember.findById(memberId);
      
      if (!member) {
        return res.status(400).json({
          success: false,
          error: 'Family member not found'
        });
      }
      
      familyId = member.familyId;
      console.log('🟡 [DOCUMENTS] Got familyId from member:', familyId);
    }

    if (!familyId) {
      return res.status(400).json({
        success: false,
        error: 'Family ID not found. Please ensure user has a family.'
      });
    }

    const fileUrl = `/uploads/documents/${Date.now()}-${req.file.originalname}`;
    const publicId = `doc_${Date.now()}`;

    const document = new Document({
      familyId: familyId,
      memberId: memberId,
      title: title,
      description: description || '',
      documentType: documentType,
      fileUrl: fileUrl,
      publicId: publicId,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentDate: documentDate || Date.now(),
      tags: tags ? JSON.parse(tags) : [],
      uploadedBy: req.user._id || req.userId // Use user._id from req.user
    });

    await document.save();

    console.log('✅ [DOCUMENTS] Document saved successfully');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('❌ [DOCUMENTS] Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all documents for the family - USE protect
router.get('/family', protect, async (req, res) => {
  try {
    const documents = await Document.find({ 
      familyId: req.user.familyId 
    })
    .sort({ uploadDate: -1 })
    .populate('memberId', 'name relation')
    .populate('uploadedBy', 'name email');

    res.json({
      success: true,
      documents: documents || []
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete document - USE protect
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      familyId: req.user.familyId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    await Document.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;