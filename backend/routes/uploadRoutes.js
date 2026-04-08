const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ErrorResponse } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists before handling files.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Invalid file type. Only JPEG, PNG, and PDF are allowed.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @desc    Upload receipt file
 * @route   POST /api/upload/receipt
 * @access  Private/Student
 */
router.post('/receipt', protect, authorize('student'), upload.single('receipt'), (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No file uploaded', 400));
    }

    // Return the file path as URL (for local development)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;