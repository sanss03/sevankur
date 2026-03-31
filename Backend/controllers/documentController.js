const upload = require('../middleware/fileUploadMiddleware');
const documentParserService = require('../services/documentParserService');
const documentKnowledgeBase = require('../services/documentKnowledgeBase');
const Document = require('../models/Document');
const mongoose = require('mongoose');

// @desc    Upload a new document, parse it, and chunk it for RAG
// @route   POST /api/documents/upload
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded' });
    }

    const { originalname, path: filePath, mimetype } = req.file;

    // 1. Create Document metadata record
    const documentRecord = await Document.create({
      fileName: originalname,
      fileType: mimetype,
      filePath: filePath,
      uploadedBy: req.user ? req.user._id : null
    });

    // 2. Parse text from the document
    const extractedText = await documentParserService.extractText(filePath, mimetype);

    // 3. Chunk and store in Knowledge Base
    await documentKnowledgeBase.saveDocumentContent(documentRecord._id, extractedText);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: documentRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all uploaded documents list
// @route   GET /api/documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search for context within documents (RAG retrieval test)
// @route   GET /api/documents/search
exports.searchDocuments = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const results = await documentKnowledgeBase.searchRelevantChunks(query);
    res.status(200).json({
      success: true,
      query,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a document and all related chunks
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // First remove chunks via the service
    await documentKnowledgeBase.deleteDocumentChunks(documentId);
    
    // Delete Document record
    const deletedDoc = await Document.findByIdAndDelete(documentId);
    
    if (!deletedDoc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, message: 'Document and all chunks deleted completely' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chunks for a specific document (Context View)
// @route   GET /api/documents/:id/context
exports.getDocumentContext = async (req, res) => {
  try {
    const documentId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    const DocumentChunk = mongoose.model('DocumentChunk');
    
    // Using simple find, depending on if paginate plugin is needed
    const chunks = await DocumentChunk.find({ documentId })
                                      .sort({ chunkIndex: 1 })
                                      .skip((page - 1) * limit)
                                      .limit(parseInt(limit));
    
    const total = await DocumentChunk.countDocuments({ documentId });

    res.status(200).json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      count: chunks.length,
      totalChunks: total,
      data: chunks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
