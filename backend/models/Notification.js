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
        'coach_assigned_to_sport',
        'location_booking_approved',
        'location_booking_declined',
        'location_booking_clash',
        'location_booking_request_submitted',
        'admin_location_booking_request',
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
    relatedLocationBookingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LocationBookingRequest',
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
