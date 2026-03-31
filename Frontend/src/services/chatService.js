const API_BASE_URL = "http://localhost:5000";

/**
 * Sends a message to the AI chat backend.
 * @param {string} message - User's query
 * @returns {Promise<any>} - AI response object
 */
export const sendMessage = async (message) => {
  // TASK 3: Add debug log
  console.log("Sending message:", message);

  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    
    // TASK 3: Add debug log
    console.log("Received response:", data);

    if (!res.ok) {
      throw new Error(data.text || data.message || `Server error: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("Fetch error in sendMessage:", error);
    return { text: "Error processing request", data: [], chartData: {} };
  }
};

/**
 * Sends a message and returns the full response object { text, data, chartData }
 * @param {string} message - User's query
 * @returns {Promise<object>}
 */
export const sendUserMessage = async (message) => {
  const data = await sendMessage(message);
  return { ...data, timestamp: new Date(), messageReceived: true };
};

/**
 * Checks if the backend server is reachable.
 * @returns {Promise<boolean>}
 */
export async function getServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/test`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Retrieves detailed backend system status.
 * @returns {Promise<object>}
 */
export async function getServerStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/system/health`);
    return await res.json();
  } catch (error) {
    console.error("Error in getServerStatus:", error);
    throw error;
  }
}
