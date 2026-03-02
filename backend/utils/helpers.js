/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Pagination Helper
 * Creates pagination metadata
 */
const getPaginationData = (page, limit, total) => {
  return {
    page: Number(page),
    limit: Number(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

/**
 * Date Helper
 * Format date for consistent output
 */
const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Time Helper
 * Check if two time ranges overlap
 */
const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Response Helper
 * Standard success response format
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Response Helper
 * Standard error response format
 */
const sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = {
  asyncHandler,
  getPaginationData,
  formatDate,
  doTimeRangesOverlap,
  sendSuccess,
  sendError,
};
