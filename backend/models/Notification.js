const mongoose = require('mongoose');

/**
 * Notification Schema
 * Manages in-app notifications for users
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: [
        'session_time_change',
        'join_request_accepted',
        'join_request_rejected',
        'session_cancelled',
        'new_session_available',
        'other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    // Related entities for reference
    relatedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeSession',
    },
    relatedSport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
