const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const joinRequestController = require('../controllers/joinRequestController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/join-requests/student/my-requests
 * @desc    Get student's own join requests
 * @access  Private/Student
 */
router.get(
  '/student/my-requests',
  protect,
  authorize('student'),
  joinRequestController.getMyJoinRequests
);

/**
 * @route   GET /api/join-requests/coach/my-requests
 * @desc    Get join requests for coach's sessions
 * @access  Private/Coach
 */
router.get(
  '/coach/my-requests',
  protect,
  authorize('coach'),
  joinRequestController.getMyCoachRequests
);

/**
 * @route   GET /api/join-requests
 * @desc    Get all join requests (filtered by role)
 * @access  Private/Coach, Admin
 */
router.get(
  '/',
  protect,
  authorize('coach', 'admin'),
  joinRequestController.getJoinRequests
);

/**
 * @route   GET /api/join-requests/:id
 * @desc    Get single join request
 * @access  Private
 */
router.get('/:id', protect, joinRequestController.getJoinRequest);

/**
 * @route   POST /api/join-requests
 * @desc    Create join request
 * @access  Private/Student
 */
router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Message must not exceed 500 characters'),
  ],
  validate,
  joinRequestController.createJoinRequest
);

/**
 * @route   PUT /api/join-requests/:id
 * @desc    Update join request status (accept/reject)
 * @access  Private/Coach
 */
router.put(
  '/:id',
  protect,
  authorize('coach'),
  [
    body('status')
      .isIn(['accepted', 'rejected'])
      .withMessage('Status must be "accepted" or "rejected"'),
    body('responseMessage')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Response message must not exceed 500 characters'),
  ],
  validate,
  joinRequestController.updateJoinRequestStatus
);

/**
 * @route   PUT /api/join-requests/:id/accept
 * @desc    Accept a join request
 * @access  Private/Coach
 */
router.put(
  '/:id/accept',
  protect,
  authorize('coach'),
  [
    body('responseMessage')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Response message must not exceed 500 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      req.body.status = 'accepted';
      await joinRequestController.updateJoinRequestStatus(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/join-requests/:id/decline
 * @desc    Decline a join request
 * @access  Private/Coach
 */
router.put(
  '/:id/decline',
  protect,
  authorize('coach'),
  [
    body('responseMessage')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Response message must not exceed 500 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      req.body.status = 'rejected';
      await joinRequestController.updateJoinRequestStatus(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/join-requests/:id
 * @desc    Delete join request
 * @access  Private/Student (own) or Admin
 */
router.delete(
  '/:id',
  protect,
  authorize('student', 'admin'),
  joinRequestController.deleteJoinRequest
);

module.exports = router;
