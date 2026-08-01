const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]: ', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  return ApiResponse.error(res, message, statusCode, errorCode);
};

module.exports = errorHandler;
