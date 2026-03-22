const mongoose = require('mongoose');

/**
 * Payment Schema
 * Handles both Event Payments and Item Purchases
 * Supports manual and direct payment methods
 */
const paymentSchema = new mongoose.Schema(
  {
    // Reference to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Payment type (Event or Item)
    type: {
      type: String,
      enum: ['event', 'item'],
      required: true,
    },

    // Reference to Event ID or Order ID
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Payment amount
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },

    // Payment status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'delivered'],
      default: 'pending',
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ['bank_transfer'],
      required: true,
    },

    // Transaction reference (for manual payments)
    transactionRef: {
      type: String,
      trim: true,
    },

    // Uploaded receipt (image/PDF URL)
    receiptUrl: {
      type: String,
    },

    // Admin verification
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    verifiedAt: {
      type: Date,
    },

    // Optional note (e.g., rejection reason)
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('Payment', paymentSchema);