const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png',
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

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === 'application/pdf';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'kutumbcare/documents',
        resource_type: isPdf ? 'raw' : 'image',
        access_mode: 'public',
        public_id: `doc_${Date.now()}`
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload document
router.post('/upload', protect, upload.single('document'), async (req, res) => {
  try {
    console.log('🟡 [DOCUMENTS] req.user:', req.user);
    console.log('🟡 [DOCUMENTS] req.body:', req.body);

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { memberId, title, description, documentType, documentDate, tags } = req.body;

    if (!memberId || !title || !documentType) {
      return res.status(400).json({
        success: false,
        error: 'Member ID, title, and document type are required'
      });
    }

    const Member = require('../models/Member');
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(400).json({ success: false, error: 'Family member not found' });
    }

    // Upload to Cloudinary
    console.log('🟡 [DOCUMENTS] Uploading to Cloudinary...');
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
    console.log('✅ [DOCUMENTS] Cloudinary upload success:', cloudinaryResult.secure_url);

    const document = new Document({
      familyId: member.userId,
      memberId: memberId,
      title: title,
      description: description || '',
      documentType: documentType,
      fileUrl: cloudinaryResult.secure_url,   // 👈 real Cloudinary URL
      publicId: cloudinaryResult.public_id,   // 👈 real public_id for deletion
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentDate: documentDate || Date.now(),
      tags: tags ? JSON.parse(tags) : [],
      uploadedBy: req.user._id
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all documents for the family
router.get('/family', protect, async (req, res) => {
  try {
    const documents = await Document.find({ familyId: req.user._id })
      .sort({ uploadDate: -1 })
      .populate('memberId', 'name relation')
      .populate('uploadedBy', 'name email');

    res.json({ success: true, documents: documents || [] });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get documents by member
router.get('/member/:memberId', protect, async (req, res) => {
  try {
    const documents = await Document.find({
      memberId: req.params.memberId,
      familyId: req.user._id
    })
    .sort({ uploadDate: -1 })
    .populate('memberId', 'name relation');

    res.json({ success: true, documents: documents || [] });
  } catch (error) {
    console.error('Fetch by member error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete document
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log('🟡 [DELETE] Document ID:', req.params.id);
    console.log('🟡 [DELETE] User ID:', req.user._id);

    const document = await Document.findOne({
      _id: req.params.id,
      familyId: req.user._id
    });

    console.log('🟡 [DELETE] Found document:', document);

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Delete from Cloudinary
    if (document.publicId) {
      const resourceType = document.fileType === 'application/pdf' ? 'image' : 'image'; // 👈 always 'image'
      await cloudinary.uploader.destroy(document.publicId, { resource_type: resourceType });
      console.log('✅ [DOCUMENTS] Deleted from Cloudinary');
    }

    await Document.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;