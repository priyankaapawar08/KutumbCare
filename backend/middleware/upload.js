const multer = require('multer');
const path = require('path');

// Check if Cloudinary is configured
let cloudinaryStorage;
let cloudinary;

try {
  cloudinary = require('../config/cloudinary');
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  
  cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'kutumbcare/documents',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      resource_type: 'auto',
      transformation: [{ quality: 'auto' }]
    }
  });
} catch (error) {
  console.error('⚠️ Cloudinary not configured. Using local storage.');
  cloudinaryStorage = null;
}

// Fallback to local storage if Cloudinary is not configured
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const storage = cloudinaryStorage || localStorage;

// File filter
const fileFilter = (req, file, cb) => {
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
    cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOC, and DOCX are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;