const { StoryForgeError } = require('./types');

// Convert any error to a StoryForgeError
function normalizeError(error) {
  if (error instanceof StoryForgeError) {
    return error;
  }

  // Handle network errors
  if (error.name === 'NetworkError' || error.message.includes('network')) {
    return new APIError('Network connection failed', 'NETWORK_ERROR', {
      originalError: error.message,
    });
  }

  // Handle JSON parsing errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return new APIError('Invalid JSON response', 'INVALID_JSON', {
      originalError: error.message,
    });
  }

  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return new DatabaseError(
      'Database operation failed',
      `DB_${error.code || 'ERROR'}`,
      {
        originalError: error.message,
        code: error.code,
      }
    );
  }

  // Default error
  return new StoryForgeError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    {
      originalError: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  );
}

// Format error for API response
function formatErrorResponse(error) {
  const normalizedError = normalizeError(error);

  return {
    success: false,
    error: {
      message: normalizedError.message,
      code: normalizedError.code,
      name: normalizedError.name,
      details: normalizedError.details,
      timestamp: normalizedError.timestamp,
    },
  };
}

// Log error with appropriate severity
function logError(error, context = {}) {
  const normalizedError = normalizeError(error);
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: normalizedError.name,
    message: normalizedError.message,
    code: normalizedError.code,
    details: normalizedError.details,
    context,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };

  // Log to console for now, can be extended to use proper logging service
  console.error('Error occurred:', errorLog);

  // TODO: Add integration with proper logging service (e.g., Winston, Bunyan)
  // TODO: Add error monitoring service integration (e.g., Sentry)

  return errorLog;
}

// API middleware for handling errors
function apiErrorHandler(err, req, res, next) {
  // Log the error
  logError(err, {
    url: req.url,
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  // Send formatted error response
  const errorResponse = formatErrorResponse(err);
  const statusCode = getHttpStatusCode(err);

  res.status(statusCode).json(errorResponse);
}

// Get appropriate HTTP status code for error
function getHttpStatusCode(error) {
  const normalizedError = normalizeError(error);

  const statusCodes = {
    ValidationError: 400,
    AuthError: 401,
    NotFoundError: 404,
    RateLimitError: 429,
    DatabaseError: 503,
    AIServiceError: 503,
    APIError: 500,
    StoryForgeError: 500,
  };

  return statusCodes[normalizedError.name] || 500;
}

// Utility function to handle async route handlers
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function logError(error, context = {}) {
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    details: error.details,
    context
  });
}

function handleError(error, req, res) {
  if (error instanceof StoryForgeError) {
    logError(error, { path: req.path, method: req.method });
    
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
        type: error.name
      }
    });
  }

  // Handle unknown errors
  logError(error, { path: req.path, method: req.method });
  
  return res.status(500).json({
    error: {
      message: 'An unexpected error occurred',
      type: 'InternalServerError'
    }
  });
}

function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleError(error, req, res);
    }
  };
}

module.exports = {
  normalizeError,
  formatErrorResponse,
  logError,
  apiErrorHandler,
  getHttpStatusCode,
  asyncHandler,
  logError,
  handleError,
  withErrorHandler
};
