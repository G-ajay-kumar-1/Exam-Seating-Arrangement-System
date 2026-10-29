export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

export function errorHandler(error, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : error.name === 'ValidationError' || error.name === 'CastError'
      ? 400
      : 500;
  const message = error.name === 'CastError'
    ? 'Invalid resource identifier.'
    : status === 500
      ? 'Something went wrong. Please try again.'
      : error.message;
  res.status(status).json({
    message,
    detail: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
}
