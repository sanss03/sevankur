import { saveMessage, getChatHistory } from "./historyService";
import { generateAIResponse } from "./aiService";

/**
 * Orchestrates the full message lifecycle: Validation -> Save -> Generation -> Save -> Formatting.
 * @param {string} userMessage - The raw message from the user
 * @param {Array} chatHistory - Current conversation history
 * @returns {Promise<object>} - { userMessage, aiResponse, responseTime, tokensUsed, model }
 */
export async function processUserMessage(userMessage, chatHistory = []) {
  const startTime = Date.now();
  const maxRetries = 2;
  const maxChars = 2000;

  // 1. Validate
  if (!userMessage?.trim()) throw new Error("Message cannot be empty.");
  if (userMessage.length > maxChars) throw new Error(`Message is too long (max ${maxChars} chars).`);

  // 2. Save User Message to Backend
  await saveMessage("user", userMessage.trim());

  let retryCount = 0;
  let aiData;

  // 3. Generate AI Response with Retry Logic
  while (retryCount <= maxRetries) {
    try {
      aiData = await generateAIResponse(userMessage, chatHistory);
      break;
    } catch (e) {
      retryCount++;
      if (retryCount > maxRetries) throw e;
      console.warn(`AI Generation retry ${retryCount}...`);
      await new Promise(res => setTimeout(res, 1000)); // Delay before retry
    }
  }

  // 4. Process AI Response
  const aiText = aiData?.text || "I'm sorry, I couldn't generate a response.";
  
  // 5. Save AI Response to Backend
  await saveMessage("bot", aiText);

  // 6. Return Structured Result
  return {
    userMessage: userMessage,
    aiResponse: aiText,
    responseTime: Date.now() - startTime,
    tokensUsed: aiData?.tokens || 0,
    model: aiData?.model || "unknown"
  };
}

/**
 * Loads and formats the chat history into a structure the AI service understands.
 * @returns {Promise<Array>}
 */
export async function loadAndPrepareHistory() {
  try {
    const rawHistory = await getChatHistory();
    
    // Sort and format for AI context window
    return rawHistory
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(m => ({
        sender: m.sender,
        content: m.text,
        timestamp: m.timestamp
      }));
  } catch (e) {
    console.error("Failed to prepare history for AI:", e);
    return [];
  }
}
