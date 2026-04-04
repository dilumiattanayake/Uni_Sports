const multer = require('multer');
const path = require('path');

// 1. Configure Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This dictates where the files will be saved
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    // Example: image-1678901234-567.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Configure File Filter (Security)
const fileFilter = (req, file, cb) => {
  // Accept only specific image types
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  
  // Check the extension
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mime type
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports images (jpeg, jpg, png, webp).'));
  }
};

// 3. Initialize Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;