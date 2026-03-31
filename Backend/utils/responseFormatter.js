/**
 * Utility to standardize all API responses from the backend
 */
class ResponseFormatter {
  /**
   * Successful response
   */
  success(data, message = 'Operation successful', statusCode = 200) {
    return {
      statusCode,
      body: {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Error response
   */
  error(message = 'An unexpected error occurred', statusCode = 500, errors = null) {
    return {
      statusCode,
      body: {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Helper to send response via Express res object
   */
  send(res, formattedResponse) {
    return res.status(formattedResponse.statusCode).json(formattedResponse.body);
  }
}

module.exports = new ResponseFormatter();
