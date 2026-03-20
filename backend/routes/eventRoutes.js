
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/events/my-events
 * @desc    Get logged-in student's registered events
 * @access  Private/Student
 */
router.get('/my-events', protect, authorize('student'), eventController.getMyEvents);

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', eventController.getEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event
 * @access  Public
 */
router.get('/:id', eventController.getEvent);

/**
 * @route   POST /api/events
 * @desc    Create event
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Event title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('sport').notEmpty().withMessage('Sport is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('registrationDeadline')
      .isISO8601()
      .withMessage('Valid registration deadline is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('maxParticipants')
      .isInt({ min: 1 })
      .withMessage('Max participants must be at least 1'),
    body('registrationFormUrl')
      .optional()
      .isURL()
      .withMessage('Registration form URL must be a valid URL'),
  ],
  validate,
  eventController.createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('title').optional().trim().notEmpty().withMessage('Event title cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('registrationDeadline')
      .optional()
      .isISO8601()
      .withMessage('Valid registration deadline is required'),
    body('maxParticipants')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max participants must be at least 1'),
    body('status')
      .optional()
      .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
      .withMessage('Invalid status value'),
    body('registrationFormUrl')
      .optional()
      .isURL()
      .withMessage('Registration form URL must be a valid URL'),
  ],
  validate,
  eventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), eventController.deleteEvent);

/**
 * @route   POST /api/events/:id/register
 * @desc    Register student for an event
 * @access  Private/Student
 */
router.post(
  '/:id/register',
  protect,
  authorize('student'),
  eventController.registerForEvent
);

/**
 * @route   DELETE /api/events/:id/register
 * @desc    Unregister student from an event
 * @access  Private/Student
 */
router.delete(
  '/:id/register',
  protect,
  authorize('student'),
  eventController.unregisterFromEvent
);

/**
 * @route   GET /api/events/:id/registrations
 * @desc    Get all registrations for an event
 * @access  Private/Admin
 */
router.get(
  '/:id/registrations',
  protect,
  authorize('admin'),
  eventController.getEventRegistrations
);

/**
 * @route   PUT /api/events/:id/registrations/:registrationId
 * @desc    Update a student's registration status
 * @access  Private/Admin
 */
router.put(
  '/:id/registrations/:registrationId',
  protect,
  authorize('admin'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'waitlisted', 'cancelled'])
      .withMessage('Invalid registration status'),
  ],
  validate,
  eventController.updateRegistrationStatus
);

module.exports = router;