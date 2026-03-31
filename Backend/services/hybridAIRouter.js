const intentDetectionService = require('./intentDetectionService');
const aiResponseGenerator = require('./aiResponseGenerator');
const documentQAService = require('./documentQAService');
const Property = require('../models/Property');

/**
 * Intelligent Router that determines the best source of knowledge 
 * for a given municipal query.
 */
class HybridAIRouter {
  /**
   * Routes the query to the correct service (Database, Document, or AI)
   */
  async routeQuery(message) {
    try {
      // 1. Detect Intent and Extract Entities
      const detection = await intentDetectionService.detectIntent(message);

      // 2. Decide and Execute
      let data = [];
      let text = "";

      if (detection.intent === "DATA_QUERY" && detection.entities) {
        // Mode A: Database Logic (Structures/Tables)
        data = await this.fetchDatabaseData(detection.entities);
        text = await aiResponseGenerator.generateResponse(message, data, detection.intent);

      } else if (detection.intent === "DOCUMENT_QUERY") {
        // Mode B: Document Knowledge Logic (Unstructured PDFs/DOCX)
        text = await documentQAService.answerQuestion(message);

      } else {
        // Mode C: General Conversation
        text = await aiResponseGenerator.generateResponse(message, [], detection.intent);
      }

      return {
        text,
        data,
        intent: detection.intent,
        confidence: detection.confidence
      };

    } catch (error) {
      console.error("❌ Hybrid Router Error:", error.message);
      throw error;
    }
  }

  /**
   * Helper to build and execute MongoDB queries from entities
   */
  async fetchDatabaseData(entities) {
    const filters = {};
    if (entities.ward) filters.ward = entities.ward;
    if (entities.city) filters["address.city"] = entities.city;
    if (entities.propertyId) filters.propertyId = entities.propertyId;
    
    return await Property.find(filters).limit(5).lean();
  }
}

module.exports = new HybridAIRouter();
