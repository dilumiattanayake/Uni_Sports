const Payment = require('../models/Payment');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get all payments (with filters)
 * @route   GET /api/payments
 * @access  Private/Admin
 */
const getPayments = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's payments
 * @route   GET /api/payments/my
 * @access  Private/Student
 */
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create direct payment (Event or Item)
 * @route   POST /api/payments
 * @access  Private/Student
 */
const createPayment = async (req, res, next) => {
  try {
    const { type, referenceId, amount, paymentMethod } = req.body;

    const payment = await Payment.create({
      user: req.user.id,
      type,
      referenceId,
      amount,
      paymentMethod,
      status: type === 'item' ? 'paid' : 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit manual payment (upload receipt)
 * @route   POST /api/payments/manual
 * @access  Private/Student
 */
const submitManualPayment = async (req, res, next) => {
  try {
    const { type, referenceId, amount, transactionRef, receiptUrl } = req.body;

    const payment = await Payment.create({
      user: req.user.id,
      type,
      referenceId,
      amount,
      paymentMethod: 'bank_transfer',
      transactionRef,
      receiptUrl,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payment submitted for verification',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment (Admin approves/rejects)
 * @route   PUT /api/payments/:id/verify
 * @access  Private/Admin
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    payment.status = status;
    payment.note = note;
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = new Date();

    await payment.save();

    res.status(200).json({
      success: true,
      message: `Payment ${status}`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single payment
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email');

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate payment report
 * @route   GET /api/payments/report
 * @access  Private/Admin
 */
const getPaymentReport = async (req, res, next) => {
  try {
    const total = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const byType = await Payment.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: total[0] || { totalAmount: 0, count: 0 },
      byType,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getMyPayments,
  createPayment,
  submitManualPayment,
  verifyPayment,
  getPayment,
  getPaymentReport,
};