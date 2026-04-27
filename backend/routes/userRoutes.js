const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/users
 * @desc    Get all users (with filters)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), userController.getUsers);

/**
 * @route   GET /api/users/me/billing-details
 * @desc    Get logged-in user's billing details
 * @access  Private/Student
 */
router.get(
  '/me/billing-details',
  protect,
  authorize('student'),
  userController.getMyBillingDetails
);

/**
 * @route   PUT /api/users/me/billing-details
 * @desc    Update logged-in user's billing details
 * @access  Private/Student
 */
router.put(
  '/me/billing-details',
  protect,
  authorize('student'),
  [
    body('billingDetails.name').trim().notEmpty().withMessage('Billing name is required'),
    body('billingDetails.email').isEmail().withMessage('Valid billing email is required'),
    body('billingDetails.phone')
      .matches(/^\d{10}$/)
      .withMessage('Billing phone must be exactly 10 digits'),
    body('billingDetails.address.street').trim().notEmpty().withMessage('Street address is required'),
    body('billingDetails.address.city').trim().notEmpty().withMessage('City is required'),
    body('billingDetails.address.state').trim().notEmpty().withMessage('District/Province is required'),
    body('billingDetails.address.zipCode').trim().notEmpty().withMessage('Postal code is required'),
    body('billingDetails.address.country').trim().notEmpty().withMessage('Country is required'),
  ],
  validate,
  userController.updateMyBillingDetails
);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private/Admin
 */
router.get('/:id', protect, authorize('admin'), userController.getUser);

/**
 * @route   POST /api/users
 * @desc    Create user
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['admin', 'coach', 'student'])
      .withMessage('Invalid role'),
  ],
  validate,
  userController.createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

/**
 * @route   PUT /api/users/:id/assign-sports
 * @desc    Assign sports to coach
 * @access  Private/Admin
 */
router.put(
  '/:id/assign-sports',
  protect,
  authorize('admin'),
  [
    body('sportIds')
      .isArray()
      .withMessage('sportIds must be an array'),
  ],
  validate,
  userController.assignSportsToCoach
);

module.exports = router;
