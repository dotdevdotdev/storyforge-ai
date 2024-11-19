import { apiErrorHandler } from '../lib/errors/handler';

// Rate limiting error middleware
export function rateLimitMiddleware(err, req, res, next) {
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: err.retryAfter,
      },
    });
  }
  next(err);
}

// Validation error middleware
export function validationMiddleware(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.details,
      },
    });
  }
  next(err);
}

// Not found error middleware
export function notFoundMiddleware(req, res, next) {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.name = 'NotFoundError';
  err.status = 404;
  next(err);
}

// Final error handling middleware
export function finalErrorMiddleware(err, req, res, next) {
  // Use the generic API error handler
  apiErrorHandler(err, req, res, next);
}

// Export middleware stack
export const errorMiddleware = [
  rateLimitMiddleware,
  validationMiddleware,
  notFoundMiddleware,
  finalErrorMiddleware,
];
