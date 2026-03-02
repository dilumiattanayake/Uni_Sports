const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/sessions/coach/my-sessions
 * @desc    Get coach's own sessions
 * @access  Private/Coach
 */
router.get('/coach/my-sessions', protect, authorize('coach'), sessionController.getMyCoachSessions);

/**
 * @route   GET /api/sessions/student/my-sessions
 * @desc    Get student's enrolled sessions
 * @access  Private/Student
 */
router.get(
  '/student/my-sessions',
  protect,
  authorize('student'),
  sessionController.getMyStudentSessions
);

/**
 * @route   GET /api/sessions
 * @desc    Get all practice sessions
 * @access  Public
 */
router.get('/', sessionController.getSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get single session
 * @access  Public
 */
router.get('/:id', sessionController.getSession);

/**
 * @route   POST /api/sessions
 * @desc    Create practice session
 * @access  Private/Coach
 */
router.post(
  '/',
  protect,
  authorize('coach'),
  [
    body('sport').notEmpty().withMessage('Sport is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
  ],
  validate,
  sessionController.createSession
);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update practice session
 * @access  Private/Coach (own) or Admin
 */
router.put(
  '/:id',
  protect,
  authorize('coach', 'admin'),
  sessionController.updateSession
);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete/Cancel practice session
 * @access  Private/Coach (own) or Admin
 */
router.delete(
  '/:id',
  protect,
  authorize('coach', 'admin'),
  sessionController.deleteSession
);

module.exports = router;
