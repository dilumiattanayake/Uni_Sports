const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/payments
 * @desc    Get all payments (with filters)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), paymentController.getPayments);

/**
 * @route   GET /api/payments/my
 * @desc    Get logged-in user's payments
 * @access  Private/Student
 */
router.get('/my', protect, authorize('student'), paymentController.getMyPayments);

/**
 * @route   GET /api/payments/:id
 * @desc    Get single payment
 * @access  Private
 */
router.get('/:id', protect, paymentController.getPayment);

/**
 * @route   POST /api/payments
 * @desc    Create direct payment (event/item)
 * @access  Private/Student
 */
router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('type')
      .isIn(['event', 'item'])
      .withMessage('Type must be event or item'),
    body('referenceId')
      .notEmpty()
      .withMessage('Reference ID is required'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number'),
    body('paymentMethod')
      .isIn(['bank_transfer'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  paymentController.createPayment
);

/**
 * @route   POST /api/payments/manual
 * @desc    Submit manual payment (receipt upload)
 * @access  Private/Student
 */
router.post(
  '/manual',
  protect,
  authorize('student'),
  [
    body('type')
      .isIn(['event', 'item'])
      .withMessage('Type must be event or item'),
    body('referenceId')
      .notEmpty()
      .withMessage('Reference ID is required'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number'),
    body('transactionRef')
      .notEmpty()
      .withMessage('Transaction reference is required'),
    body('receiptUrl')
      .isURL({ require_tld: false })
      .withMessage('Valid receipt URL is required'),
    body('billingDetails.name')
      .trim()
      .notEmpty()
      .withMessage('Billing name is required'),
    body('billingDetails.email')
      .isEmail()
      .withMessage('Valid billing email is required'),
    body('billingDetails.phone')
      .matches(/^\d{10}$/)
      .withMessage('Billing phone must be exactly 10 digits'),
    body('billingDetails.address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('billingDetails.address.city')
      .trim()
      .notEmpty()
      .withMessage('City is required'),
    body('billingDetails.address.state')
      .trim()
      .notEmpty()
      .withMessage('District/Province is required'),
    body('billingDetails.address.zipCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required'),
    body('billingDetails.address.country')
      .trim()
      .notEmpty()
      .withMessage('Country is required'),
  ],
  validate,
  paymentController.submitManualPayment
);

/**
 * @route   PUT /api/payments/:id/verify
 * @desc    Verify payment (approve/reject)
 * @access  Private/Admin
 */
router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  [
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be approved or rejected'),
  ],
  validate,
  paymentController.verifyPayment
);

/**
 * @route   GET /api/payments/report
 * @desc    Generate payment report
 * @access  Private/Admin
 */
router.get(
  '/report',
  protect,
  authorize('admin'),
  paymentController.getPaymentReport
);

module.exports = router;