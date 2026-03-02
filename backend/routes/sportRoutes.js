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

module.exports = router;
