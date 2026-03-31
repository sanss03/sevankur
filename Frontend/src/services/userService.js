import { fetchWrapper } from "../utils/apiConfig";

/**
 * Retrieves the current user's profile information.
 * @returns {Promise<object>} - { id, username, email, createdAt, status }
 */
export async function getUserProfile() {
  try {
    return await fetchWrapper("/api/user/profile", { method: "GET" });
  } catch (error) {
    console.error("Error in userService.getUserProfile:", error);
    throw error;
  }
}

/**
 * Updates the current user's profile details.
 * @param {string} username - New username
 * @param {string} email - New email address
 * @returns {Promise<object>} - Updated user object
 */
export async function updateUserProfile(username, email) {
  if (!username?.trim() || !email?.trim()) {
    throw new Error("Both username and email are required for update.");
  }

  try {
    return await fetchWrapper("/api/user/profile", {
      method: "PUT",
      body: { username: username.trim(), email: email.trim() }
    });
  } catch (error) {
    console.error("Error in userService.updateUserProfile:", error);
    throw error;
  }
}

/**
 * Retrieves the user's personal display and interaction settings.
 * @returns {Promise<object>} - { theme, language, notifications, autoSave, fontSize }
 */
export async function getUserSettings() {
  try {
    return await fetchWrapper("/api/user/settings", { method: "GET" });
  } catch (error) {
    console.error("Error in userService.getUserSettings:", error);
    throw error;
  }
}
