const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration – keep original filename with timestamp to avoid collisions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `${safeName}_${timestamp}${ext}`);
  }
});

// File type validation – only PDF and DOCX (including legacy .doc)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    // DOCX (Office Open XML)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Legacy Word document
    'application/msword'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

// Limits – 10 MB per file, 5 files max per request (adjust as needed)
const limits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
  files: 5
};

// Export a ready‑to‑use middleware for a single file field named "document"
const upload = multer({ storage, fileFilter, limits }).single('document');

module.exports = upload;
