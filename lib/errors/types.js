// Custom error classes for different types of errors
class StoryForgeError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation Errors
class ValidationError extends StoryForgeError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

// Authentication Errors
class AuthenticationError extends StoryForgeError {
  constructor(message, details = null) {
    super(message, 401, details);
  }
}

// Authorization Errors
class AuthorizationError extends StoryForgeError {
  constructor(message, details = null) {
    super(message, 403, details);
  }
}

// Resource Not Found Error
class NotFoundError extends StoryForgeError {
  constructor(message, details = null) {
    super(message, 404, details);
  }
}

// Database Errors
class DatabaseError extends StoryForgeError {
  constructor(message, details = null) {
    super(message, 500, details);
  }
}

// AI Service Errors
class AIServiceError extends StoryForgeError {
  constructor(message, details = null) {
    super(message, 503, details);
  }
}

module.exports = {
  StoryForgeError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  AIServiceError
};
