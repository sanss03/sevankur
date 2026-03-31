import { fetchWrapper } from "../utils/apiConfig";

/**
 * Retrieves the full persistent chat history from the server.
 * @returns {Promise<Array>} - Array of messages: [{ id, sender, text, timestamp }, ...]
 */
export async function getChatHistory() {
  try {
    const data = await fetchWrapper("/api/history", { method: "GET" });
    return data || [];
  } catch (error) {
    console.warn("Could not fetch chat history, returning empty array.");
    return [];
  }
}

/**
 * Saves a single message to the persistent chat history.
 * @param {string} sender - 'user' or 'bot'
 * @param {string} text - Message content
 * @returns {Promise<object>} - Saved message with id and timestamp
 */
export async function saveMessage(sender, text) {
  const validSenders = ["user", "bot"];
  if (!validSenders.includes(sender)) throw new Error("Invalid sender type.");
  if (!text?.trim()) throw new Error("Message text is required.");

  try {
    return await fetchWrapper("/api/history/save", {
      method: "POST",
      body: { sender, text: text.trim() }
    });
  } catch (error) {
    console.error("Error in historyService.saveMessage:", error);
    throw error;
  }
}

/**
 * Deletes a specific message from history by ID.
 * @param {string} messageId - The unique ID of the message
 * @returns {Promise<boolean>}
 */
export async function deleteMessage(messageId) {
  try {
    await fetchWrapper(`/api/history/${messageId}`, { method: "DELETE" });
    return true;
  } catch (error) {
    console.error("Error in historyService.deleteMessage:", error);
    return false;
  }
}

/**
 * Wipes the entire chat history after confirmation.
 * @returns {Promise<object>} - { success: boolean, count: number }
 */
export async function clearChatHistory() {
  if (!window.confirm("Are you sure you want to PERMANENTLY delete all chat history?")) {
    return { success: false, count: 0 };
  }

  try {
    const data = await fetchWrapper("/api/history/clear", { method: "DELETE" });
    return { success: true, count: data?.count || 0 };
  } catch (error) {
    console.error("Error in historyService.clearChatHistory:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Exports the entire chat history as a JSON file download.
 */
export async function exportChatHistory() {
  try {
    const data = await fetchWrapper("/api/history/export", { method: "GET" });
    
    // Create and trigger download
    const date = new Date().toISOString().split('T')[0];
    const fileName = `chat-history-${date}.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    return data;
  } catch (error) {
    console.error("Error in historyService.exportChatHistory:", error);
    throw error;
  }
}
