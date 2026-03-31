const NOTIFY_EVENT = "sevankur_notify";

/**
 * Common entry point for pushing notifications out to the UI.
 * @param {string} message - Notification text
 * @param {string} type - success | error | info | warning
 * @param {number} duration - ms to persist
 */
export function showNotification(message, type = "info", duration = 3000) {
  const event = new CustomEvent(NOTIFY_EVENT, {
    detail: { message, type, duration, id: Date.now() }
  });
  window.dispatchEvent(event);
}

/**
 * Convenient shortcut for displaying success messages.
 */
export function showSuccess(message) {
  showNotification(message, "success", 4000);
}

/**
 * Convenient shortcut for displaying error messages.
 */
export function showError(message) {
  showNotification(message, "error", 5000);
}

// Internal event name constant for the container to listen on
export { NOTIFY_EVENT };
