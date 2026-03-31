const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true // Index for fast retrieval
  },
  content: {
    type: String,
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  metadata: {
    pageNumber: Number,
    section: String
  }
}, { timestamps: true });

// Full-text search index for RAG retrieval
documentChunkSchema.index({ content: 'text' });

// Add pagination for scalable search results
documentChunkSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
