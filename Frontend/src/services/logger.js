const IS_DEV = import.meta.env.DEV;
const LOG_STORAGE_KEY = "sevankur_logs";

/**
 * Standardizes log levels with colors for console.
 */
const COLORS = {
  debug: "#8b5cf6", // Purple
  info: "#3b82f6",  // Blue
  warn: "#f59e0b",  // Amber
  error: "#ef4444"  // Red
};

/**
 * Core logging function that handles console output (dev) or storage (prod).
 * @param {string} level - debug | info | warn | error
 * @param {string} message - Human readable message
 * @param {any} data - Metadata for tracing
 */
export function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, data };

  if (IS_DEV) {
    const color = COLORS[level] || "#ccc";
    console.log(
      `%c[${level.toUpperCase()}] %c${timestamp} %c${message}`,
      `color: #fff; background: ${color}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`,
      `color: #94a3b8;`,
      `color: inherit; font-weight: 500;`,
      data || ""
    );
  } else {
    // Persistent storage for production auditing
    try {
      const logs = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || "[]");
      logs.push(logEntry);
      // Keep only last 100 logs
      if (logs.length > 100) logs.shift();
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn("Logging failed in storage mode:", e);
    }
  }
}

/**
 * Specifically logs outgoing API requests.
 */
export function logRequest(method, endpoint, body = null) {
  log("debug", `API ${method} Request: ${endpoint}`, body);
}

/**
 * Specifically logs incoming API responses.
 */
export function logResponse(endpoint, status) {
  const level = status >= 400 ? "error" : "info";
  log(level, `API Response (${status}): ${endpoint}`);
}

/**
 * Tracks AI consumption and performance metrics.
 */
export function logAIGeneration(model, tokensUsed, timeMs) {
  log("info", `AI Generation with ${model}`, { tokensUsed, timeMs: `${timeMs}ms` });
}
