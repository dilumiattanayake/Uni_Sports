const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const sportController = require('../controllers/sportController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/sports/categories/list
 * @desc    Get sport categories
 * @access  Public
 */
router.get('/categories/list', sportController.getCategories);

/**
 * @route   GET /api/sports
 * @desc    Get all sports
 * @access  Public
 */
router.get('/', sportController.getSports);

/**
 * @route   GET /api/sports/:id
 * @desc    Get single sport
 * @access  Public
 */
router.get('/:id', sportController.getSport);

/**
 * @route   POST /api/sports
 * @desc    Create sport
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Sport name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .isIn(['indoor', 'outdoor', 'water', 'combat', 'team', 'individual'])
      .withMessage('Invalid category'),
  ],
  validate,
  sportController.createSport
);

/**
 * @route   PUT /api/sports/:id
 * @desc    Update sport
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), sportController.updateSport);

/**
 * @route   DELETE /api/sports/:id
 * @desc    Delete sport
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), sportController.deleteSport);

/**
 * @route   GET /api/sports/:id/coaches
 * @desc    Get all coaches assigned to a sport
 * @access  Public
 */
router.get('/:id/coaches', sportController.getSportCoaches);

/**
 * @route   GET /api/sports/:id/available-coaches
 * @desc    Get available coaches for assignment
 * @access  Private/Admin
 */
router.get('/:id/available-coaches', protect, authorize('admin'), sportController.getAvailableCoaches);

/**
 * @route   POST /api/sports/:id/coaches/:coachId
 * @desc    Assign a coach to a sport
 * @access  Private/Admin
 */
router.post('/:id/coaches/:coachId', protect, authorize('admin'), sportController.assignCoachToSport);

/**
 * @route   DELETE /api/sports/:id/coaches/:coachId
 * @desc    Remove a coach from a sport
 * @access  Private/Admin
 */
router.delete('/:id/coaches/:coachId', protect, authorize('admin'), sportController.removeCoachFromSport);

module.exports = router;
