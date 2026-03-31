const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Main chat endpoint — public (no auth required for dev/demo)
router.post('/', chatController.postChatMessage);

// New PDF Export endpoint
router.post('/export-pdf', chatController.exportPDF);

// New Audio Transcription endpoint
router.post('/transcribe', upload.single('audio'), chatController.transcribeAudio);

// GET endpoint for health checking
router.get('/', (req, res) => res.json({ message: 'Chat endpoint ready' }));

module.exports = router;
