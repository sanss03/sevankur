const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');

/**
 * Service to manage and query document chunks for AI context
 */
class DocumentKnowledgeBase {
  /**
   * Save a newly parsed document and its text chunks
   */
  /**
   * Called by documentController after a document is already saved.
   * @param {ObjectId} documentId — already-created Document._id
   * @param {string}   fullText   — extracted text from the file
   */
  async saveDocumentContent(documentId, fullText) {
    try {
      const chunks = this.chunkText(fullText || '', 2000, 200);

      const chunkDocs = chunks.map((chunk, index) => ({
        documentId,
        content: chunk,
        chunkIndex: index
      }));

      if (chunkDocs.length > 0) {
        await DocumentChunk.insertMany(chunkDocs);
      }

      console.log(`✅ KnowledgeBase: ${chunks.length} chunks stored for doc ${documentId}`);
    } catch (error) {
      console.error('❌ KnowledgeBase Error:', error.message);
      throw error;
    }
  }

  /**
   * Simple character-based text chunking
   */
  chunkText(text, size, overlap) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      chunks.push(text.slice(start, end));
      start += (size - overlap);
    }
    return chunks;
  }

  /**
   * Retrieve relevant chunks for a given query (Simplified keyword search)
   */
  async findRelevantChunks(query, limit = 3) {
    try {
      return await DocumentChunk.find({
        content: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
      }).limit(limit);
    } catch (error) {
      console.error('❌ Knowledge Retrieval Error:', error.message);
      return [];
    }
  }

  /** Alias used by documentController */
  async searchRelevantChunks(query, limit = 3) {
    return this.findRelevantChunks(query, limit);
  }

  /** Remove all chunks for a document (cascade delete) */
  async deleteDocumentChunks(documentId) {
    try {
      await DocumentChunk.deleteMany({ documentId });
    } catch (error) {
      console.error('❌ Chunk Delete Error:', error.message);
      throw error;
    }
  }
}

module.exports = new DocumentKnowledgeBase();
