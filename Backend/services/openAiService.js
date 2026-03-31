const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAiService {
  constructor() {
    this.model = "gpt-4o-mini";
  }

  /**
   * Main entry for chat completions (OpenAI SDK replacement for Grok)
   */
  async getChatCompletion(messages, options = {}) {
    console.log("Calling OpenAI API: gpt-4o-mini");
    try {
      const response = await openai.chat.completions.create({
        model: options.model || this.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        stream: false
      });

      return response;
    } catch (error) {
      console.error("❌ OpenAI Error:", error.message);
      throw error;
    }
  }

  /**
   * Helper for parsing JSON from markdown
   */
  parseJsonResponse(content) {
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("⚠️ Failed to parse JSON from OpenAI response:", e.message);
      return { text: content, intent: 'GENERAL' };
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  async transcribeAudio(filePath) {
    const fs = require("fs");
    try {
      console.log("Calling OpenAI Whisper for transcription...");
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
      });
      return transcription.text;
    } catch (error) {
      console.error("❌ OpenAI Whisper Error:", error.message);
      throw error;
    }
  }

  /**
   * Check if service is healthy
   */
  async checkHealth() {
    return !!process.env.OPENAI_API_KEY;
  }
}

module.exports = new OpenAiService();
