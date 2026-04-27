const mongoose = require('mongoose');

/**
 * Location Booking Request Schema
 * Allows coaches to request location bookings
 * Admin approves/declines the requests
 */
const locationBookingRequestSchema = new mongoose.Schema(
  {
    // Requester (Coach)
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Coach is required'],
    },
    // Sport for which location is requested
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: [true, 'Sport is required'],
    },
    // Location being requested
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location is required'],
    },
    // Date and time details
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String, // "14:00" format
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // "16:00" format
      required: [true, 'End time is required'],
    },
    // Number of participants expected
    participantCount: {
      type: Number,
      required: [true, 'Participant count is required'],
      min: 1,
    },
    // Purpose/Description
    purpose: {
      type: String,
      required: [true, 'Purpose of booking is required'],
      maxlength: 500,
    },
    // Equipment needed
    equipmentNeeded: [String],
    // Special requirements
    specialRequirements: {
      type: String,
      maxlength: 500,
    },
    // Status of the request
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'cancelled'],
      default: 'pending',
    },
    // Admin notes for decline
    adminNotes: {
      type: String,
      maxlength: 500,
    },
    // Admin who processed the request
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // When was the request processed
    processedAt: {
      type: Date,
    },
    // Clash information (if any)
    hasClash: {
      type: Boolean,
      default: false,
    },
    clashDetails: {
      clashingBookingId: mongoose.Schema.Types.ObjectId,
      clashingSport: String,
      clashingCoach: String,
      clashTime: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
locationBookingRequestSchema.index({ coach: 1, status: 1 });
locationBookingRequestSchema.index({ location: 1, date: 1 });
locationBookingRequestSchema.index({ sport: 1, status: 1 });
locationBookingRequestSchema.index({ createdAt: -1 });
locationBookingRequestSchema.index(
  { location: 1, date: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'approved'] },
    },
  }
);

module.exports = mongoose.model('LocationBookingRequest', locationBookingRequestSchema);
