const axios = require('axios');

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Enhanced Grok API Service with retry logic and timeouts
 */
class GrokService {
  constructor() {
    this.apiKey = process.env.GROK_API_KEY;
    this.timeout = 15000; // 15 seconds
    this.maxRetries = 2;
  }

  /**
   * Main entry point for generating AI completions
   */
  async getChatCompletion(messages, options = {}) {
    console.log("Calling Grok API...");
    if (!this.apiKey) {
      console.warn("⚠️ GROK_API_KEY is missing. Using fallback.");
      return null;
    }

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const response = await axios.post(
          GROK_API_URL,
          {
            model: options.model || "grok-beta",
            messages: messages,
            temperature: options.temperature || 0.1,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: this.timeout
          }
        );

        return response.data;

      } catch (error) {
        attempt++;
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error(`❌ Grok API Attempt ${attempt} failed:`, status, errorData || error.message);

        // Don't retry on certain status codes (401, 403, 400)
        if (status === 401 || status === 403 || status === 400 || attempt > this.maxRetries) {
          throw new Error(`Grok API Error: ${error.message}`);
        }

        // Exponential backoff or simple delay
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  }

  /**
   * Helper to clean and parse JSON blocks from markdown responses
   */
  parseJsonResponse(content) {
    try {
      // Remove markdown blocks if present
      const cleaned = content.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("⚠️ Failed to parse JSON from Grok response:", e.message);
      return { text: content, intent: 'GENERAL' };
    }
  }

  /**
   * Check if service is healthy
   */
  async checkHealth() {
    return !!this.apiKey;
  }
}

module.exports = new GrokService();
