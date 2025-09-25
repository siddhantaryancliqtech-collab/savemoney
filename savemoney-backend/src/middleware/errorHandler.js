export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our end'
    }
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.error.code = 'VALIDATION_ERROR';
    error.error.message = err.message;
    error.error.details = err.details;
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error.code = 'INVALID_TOKEN';
    error.error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error.code = 'TOKEN_EXPIRED';
    error.error.message = 'Token has expired';
    return res.status(401).json(error);
  }

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case 'PGRST116':
        error.error.code = 'RESOURCE_NOT_FOUND';
        error.error.message = 'Resource not found';
        return res.status(404).json(error);
      case '23505':
        error.error.code = 'DUPLICATE_ENTRY';
        error.error.message = 'Resource already exists';
        return res.status(409).json(error);
      case '23503':
        error.error.code = 'FOREIGN_KEY_VIOLATION';
        error.error.message = 'Referenced resource does not exist';
        return res.status(400).json(error);
    }
  }

  // Custom application errors
  if (err.statusCode) {
    error.error.code = err.code || 'APPLICATION_ERROR';
    error.error.message = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Default 500 error
  res.status(500).json(error);
};