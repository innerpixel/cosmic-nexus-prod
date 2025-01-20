import { AppError } from '../utils/error.js';

export const errorHandler = (err, req, res, next) => {
  // If headers are already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle 404 errors specifically
  if (err.name === 'NotFoundError') {
    err.statusCode = 400;
    err.message = 'Resource not found';
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  // Production error response
  if (err instanceof AppError) {
    // Operational, trusted error: send message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown error: don't leak error details
  console.error('ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};
