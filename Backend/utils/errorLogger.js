const winston = require('winston');
const path = require('path');

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    // Standard error log in individual file
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    // Combined log for overall activities
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
    // Console output for development
    new winston.transports.Console()
  ]
});

/**
 * Log API calls with status
 */
const logApiCall = (method, path, status, duration) => {
  logger.info(`🌐 API CALL: ${method} ${path} - Status: ${status} (${duration}ms)`);
};

/**
 * Log Grok API usage details
 */
const logGrokUsage = (prompt, result, latency) => {
  logger.info(`🧠 GROK USAGE:`, {
    promptLength: prompt.length,
    responseLength: result.length,
    latencyMs: latency
  });
};

/**
 * Log general application errors
 */
const logError = (error, context = {}) => {
  logger.error(`❌ ERROR: ${error.message}`, {
    stack: error.stack,
    ...context
  });
};

module.exports = {
  logApiCall,
  logGrokUsage,
  logError,
  logger // Export the base winston instance if needed
};
