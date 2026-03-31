const aiService = require('./aiService');
const ChatHistory = require('../models/ChatHistory');

/**
 * Orchestrator for the entire Chat processing lifecycle:
 * 1. Store History -> 2. Call AI Service (Document-Grounded) -> 3. Store History -> 4. Return Standard Response
 */
class ChatMessageProcessor {
  /**
   * Main function to process incoming user messages end-to-end
   */
  async processMessage(userId, message, context = {}) {
    try {
      const isAuthenticatedUser = userId && userId !== 'anonymous' && userId.toString().length === 24;

      // 1. Store User Message in History (only for authenticated users)
      if (isAuthenticatedUser) {
        await ChatHistory.create({
          userId,
          message: message,
          sender: 'user'
        });
      }

      // 2. Call AI Service (updated with Document Context per user requirement)
      const result = await aiService.processMessage(message);

      // 3. Store Bot Message in History (only for authenticated users)
      if (isAuthenticatedUser) {
        await ChatHistory.create({
          userId,
          message: result.text,
          sender: 'bot'
        });
      }

      // 4. Return standard format for frontend
      return {
        text: result.text,
        data: result.data || [],
        chartData: this.formatChartData(result.data),
        intent: result.intent,
        confidence: result.confidence
      };

    } catch (error) {
      console.error("❌ Chat Processor Error:", error.message);
      return {
        text: "Error processing request",
        data: [],
        chartData: {}
      };
    }
  }

  /**
   * Formats MongoDB logs into Chart.js friendly structures
   */
  formatChartData(data) {
    if (!data?.length) return {};
    return {
      labels: data.map(d => d.propertyId),
      datasets: [{ label: "Dues", data: data.map(() => 5000) }]
    };
  }
}

module.exports = new ChatMessageProcessor();
