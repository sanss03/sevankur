// Handle 404 (Not Found)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  // If status is 200, default to 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Specific handling for Mongoose validation/input errors (Invalid Input)
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
  }

  if (err.name === 'CastError') {
    statusCode = 400; // Invalid ID format etc.
  }

  res.status(statusCode).json({
    message: err.message,
    // Provide stack trace only in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
