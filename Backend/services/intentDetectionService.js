const openAiService = require('./openAiService');

/**
 * Specialized service for extracting intent and entities from natural language
 */
class IntentDetectionService {
  async detectIntent(query) {
    const messages = [
      {
        role: "system",
        content: `You are a municipal data intent classifier. 
        Classify the query into: GREETING, DATA_QUERY, DOCUMENT_QUERY, PAYMENT_HELP, FAULT_REPORT, or GENERAL.
        Identify entities like: ward (number), propertyId (string), year (string), amount (number), city (string).
        
        Respond in JSON format only: 
        { 
          "intent": "string",
          "confidence": number (0-1),
          "entities": { "ward": null, "propertyId": null, etc. } 
        }`
      },
      { role: "user", content: query }
    ];

    try {
      const completion = await openAiService.getChatCompletion(messages, { temperature: 0.1 });
      if (!completion) return this.getDefaultResponse();

      const content = completion.choices[0].message.content;
      return openAiService.parseJsonResponse(content);

    } catch (error) {
      console.error("Intent Detection Failed:", error.message);
      return this.getDefaultResponse();
    }
  }

  getDefaultResponse() {
    return {
      intent: 'GENERAL',
      confidence: 0,
      entities: {}
    };
  }
}

module.exports = new IntentDetectionService();
