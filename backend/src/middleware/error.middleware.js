// 404 — route পাওয়া যায়নি
exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

// Global error handler — সব unhandled error এখানে আসে
exports.errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  // Development-এ stack trace দেখাও, production-এ না
  const response = {
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  res.status(statusCode).json(response);
};
