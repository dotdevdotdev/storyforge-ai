const { MongoError } = require('mongodb');

const mongoErrorMiddleware = (err, req, res, next) => {
  if (err instanceof MongoError) {
    console.error('MongoDB Error:', {
      code: err.code,
      message: err.message,
      command: err.command,
      path: req.path,
      method: req.method,
    });

    // Handle specific MongoDB errors
    switch (err.code) {
      case 11000: // Duplicate key error
        return res.status(409).json({
          error: 'Duplicate entry found',
          details: 'A record with this information already exists',
        });
      
      case 121: // Document validation error
        return res.status(400).json({
          error: 'Validation failed',
          details: err.message,
        });

      default:
        return res.status(500).json({
          error: 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        });
    }
  }
  next(err);
};

module.exports = mongoErrorMiddleware;
