const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Middleware
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator'); // Your Zod validator middleware

// Zod Schemas
const { 
  createRegistrationSchema,
  updateRegistrationStatusSchema
} = require('../validators/registrationValidator');

/**
 * @route   GET /api/registrations/my-registrations
 * @desc    Get logged-in student's registrations
 * @access  Private/Student
 */
router.get(
  '/my-registrations', 
  protect, 
  authorize('student'), 
  registrationController.getMyRegistrations
);

router.get('/search-student', protect, registrationController.searchStudent);

/**
 * @route   POST /api/registrations/event/:eventId
 * @desc    Submit a new registration (Individual or Team)
 * @access  Private/Student
 */
router.post(
  '/event/:eventId',
  protect,
  authorize('student'),
  validate(createRegistrationSchema),
  registrationController.createRegistration
);

/**
 * @route   GET /api/registrations/event/:eventId
 * @desc    Get all registrations for a specific event
 * @access  Private/Admin
 */
router.get(
  '/event/:eventId',
  protect,
  authorize('admin', 'coach'),
  registrationController.getEventRegistrations
);

/**
 * @route   PUT /api/registrations/:id
 * @desc    Update team members
 * @access  Private/Student
 */
router.put(
  '/:id',
  protect,
  authorize('student'),
  registrationController.updateMyRegistration
);

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Cancel a registration
 * @access  Private/Student
 */
router.delete(
  '/:id',
  protect,
  authorize('student'),
  registrationController.cancelMyRegistration
);

module.exports = router;