const mongoose = require('mongoose');

/**
 * Join Request Schema
 * Manages student requests to join practice sessions
 */
const joinRequestSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeSession',
      required: [true, 'Session is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Coach is required'],
    },
    // Request status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Student's message/reason for joining
    message: {
      type: String,
      maxlength: 500,
    },
    // Coach's response/rejection reason
    responseMessage: {
      type: String,
      maxlength: 500,
    },
    // Decision timestamp
    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate requests
joinRequestSchema.index({ session: 1, student: 1 }, { unique: true });

// Index for querying by coach and status
joinRequestSchema.index({ coach: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
