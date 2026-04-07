const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const locationBookingController = require('../controllers/locationBookingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   POST /api/location-bookings
 * @desc    Create location booking request
 * @access  Private/Coach
 */
router.post(
  '/',
  protect,
  authorize('coach'),
  [
    body('sport').notEmpty().withMessage('Sport is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('participantCount')
      .isInt({ min: 1 })
      .withMessage('Participant count must be at least 1'),
    body('purpose')
      .trim()
      .notEmpty()
      .withMessage('Purpose is required')
      .isLength({ max: 500 })
      .withMessage('Purpose cannot exceed 500 characters'),
  ],
  validate,
  locationBookingController.createLocationBookingRequest
);

/**
 * @route   GET /api/location-bookings/coach/my-requests
 * @desc    Get current coach's location booking requests
 * @access  Private/Coach
 */
router.get(
  '/coach/my-requests',
  protect,
  authorize('coach'),
  locationBookingController.getMyLocationBookingRequests
);

/**
 * @route   GET /api/location-bookings
 * @desc    Get all location booking requests
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  authorize('admin'),
  locationBookingController.getAllLocationBookingRequests
);

/**
 * @route   GET /api/location-bookings/:id
 * @desc    Get single location booking request
 * @access  Private
 */
router.get(
  '/:id',
  protect,
  locationBookingController.getLocationBookingRequest
);

/**
 * @route   PUT /api/location-bookings/:id
 * @desc    Update location booking request
 * @access  Private/Coach
 */
router.put(
  '/:id',
  protect,
  authorize('coach'),
  [
    body('date').optional().notEmpty().withMessage('Date is required'),
    body('startTime').optional().notEmpty().withMessage('Start time is required'),
    body('endTime').optional().notEmpty().withMessage('End time is required'),
    body('participantCount')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Participant count must be at least 1'),
    body('purpose')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Purpose cannot exceed 500 characters'),
  ],
  validate,
  locationBookingController.updateLocationBookingRequest
);

/**
 * @route   PUT /api/location-bookings/:id/approve
 * @desc    Approve location booking request
 * @access  Private/Admin
 */
router.put(
  '/:id/approve',
  protect,
  authorize('admin'),
  locationBookingController.approveLocationBookingRequest
);

/**
 * @route   PUT /api/location-bookings/:id/decline
 * @desc    Decline location booking request
 * @access  Private/Admin
 */
router.put(
  '/:id/decline',
  protect,
  authorize('admin'),
  [
    body('adminNotes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Admin notes cannot exceed 500 characters'),
  ],
  validate,
  locationBookingController.declineLocationBookingRequest
);

/**
 * @route   DELETE /api/location-bookings/:id
 * @desc    Cancel location booking request
 * @access  Private/Coach
 */
router.delete(
  '/:id',
  protect,
  authorize('coach'),
  locationBookingController.cancelLocationBookingRequest
);

module.exports = router;
