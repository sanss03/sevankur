import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API Client
// Note: In Vite, we use import.meta.env for browser variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Generates an AI response for the chat conversation.
 * @param {string} userMessage - The latest user query
 * @param {Array} chatHistory - Array of objects {role: "user/bot", content: "..."}
 * @returns {Promise<object>} - { text, tokens, model }
 */
export async function generateAIResponse(userMessage, chatHistory = []) {
  if (!API_KEY) {
    return { 
      text: "VITE_GEMINI_API_KEY is missing. Please set it up in your .env file.",
      model: "error-offline"
    };
  }

  try {
    // Format history for Gemini SDK
    // Gemini roles are "user" and "model"
    const history = chatHistory.map(m => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: { maxOutputTokens: 2000 }
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return {
      text: text,
      tokens: 0, // Gemini SDK doesn't expose raw tokens easily in this call
      model: "gemini-pro"
    };
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    if (error.message.includes("quota") || error.message.includes("429")) {
      return { text: "Rate limit reached. Please wait a moment before asking again.", model: "gemini-pro-rate-limited" };
    }
    return { text: "I'm having trouble thinking clearly right now. Please try again.", model: "gemini-pro-error" };
  }
}

/**
 * Generates a short, descriptive title for the conversation.
 * @param {string} firstMessage - The user's initial message
 * @returns {Promise<string>}
 */
export async function generateChatTitle(firstMessage) {
  if (!API_KEY) return "New Sevankur Chat";
  try {
    const prompt = `Generate a very short, 3-5 word title for a chat that starts with: "${firstMessage}". Return only the title text.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.substring(0, 50).trim() || "Untitled Chat";
  } catch (e) {
    return "New Conversation";
  }
}

/**
 * Summarizes the entire conversation into a concise paragraph.
 * @param {Array} messages - The full history
 * @returns {Promise<string>}
 */
export async function generateMessageSummary(messages) {
  if (!API_KEY || !messages?.length) return "";
  try {
    const chatText = messages.map(m => `${m.sender}: ${m.content}`).join("\n");
    const prompt = `Summarize the following chat conversation in 2 concise sentences highlight the key user requests: \n\n${chatText}`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    return "Summary unavailable.";
  }
}
