const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUploadMiddleware');

// @route   POST /api/documents/upload
// @desc    Upload & process a municipal document
// @access  Private (Admins or System Operators)
router.post('/upload', protect, upload, documentController.uploadDocument);

// @route   GET /api/documents
// @desc    List all uploaded documents
// @access  Private
router.get('/', protect, documentController.getAllDocuments);

// @route   GET /api/documents/search
// @desc    Raw search across document chunks (testing RAG)
// @access  Private
router.get('/search', protect, documentController.searchDocuments);

// @route   GET /api/documents/:id/context
// @desc    View all extracted chunks for a specific document
// @access  Private
router.get('/:id/context', protect, documentController.getDocumentContext);

// @route   DELETE /api/documents/:id
// @desc    Delete a document and all associated context chunks
// @access  Private
router.delete('/:id', protect, documentController.deleteDocument);

module.exports = router;
