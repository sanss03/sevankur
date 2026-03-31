/**
 * Extracts a human-readable message from any error type.
 * @param {any} error - The error object/string
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return "An unknown error occurred.";
  if (typeof error === "string") return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return JSON.stringify(error);
}

/**
 * Checks if the error is specifically a network/connectivity issue.
 * @param {Error} error 
 * @returns {boolean}
 */
export function isNetworkError(error) {
  return (
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("fetch") ||
    error.name === "TypeError" // Standard Fetch network error name
  );
}

/**
 * Handles API errors with logging and user-friendly mapping.
 * @param {Error} error - The original error
 * @param {string} context - Where the error happened (e.g., "Login", "Chat")
 * @returns {string} - User-friendly message
 */
export function handleApiError(error, context) {
  console.error(`[API ERROR in ${context}]:`, error);

  if (isNetworkError(error)) {
    return "Connection failed. Please check your internet and try again.";
  }

  const message = error.message || "";

  if (message.includes("400")) {
    return "Invalid request. Please check your input and try again.";
  }
  if (message.includes("401")) {
    return "Session expired. Please log in again.";
  }
  if (message.includes("404")) {
    return "Requested resource not found.";
  }
  if (message.includes("500")) {
    return "Internal server error. Our team has been notified.";
  }

  return getErrorMessage(error) || "Oops! Something went wrong on our end.";
}
