const mongoose = require('mongoose');

/**
 * Practice Session Schema
 * Represents scheduled practice sessions for sports
 */
const practiceSessionSchema = new mongoose.Schema(
  {
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: [true, 'Sport is required'],
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Coach is required'],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location is required'],
    },
    // Session timing
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    // Day of week (optional, for recurring sessions)
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    // Recurring session flag
    isRecurring: {
      type: Boolean,
      default: false,
    },
    // Session details
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    // Capacity
    maxParticipants: {
      type: Number,
      default: 20,
    },
    // Enrolled students
    enrolledStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Session status
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    // Cancellation reason (if applicable)
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient clash detection queries
practiceSessionSchema.index({ location: 1, startTime: 1, endTime: 1 });
practiceSessionSchema.index({ coach: 1, startTime: 1, endTime: 1 });

// Virtual to check if session is full
practiceSessionSchema.virtual('isFull').get(function () {
  return this.enrolledStudents.length >= this.maxParticipants;
});

// Method to check for location clash
practiceSessionSchema.methods.hasLocationClash = async function () {
  const Session = mongoose.model('PracticeSession');
  const clash = await Session.findOne({
    _id: { $ne: this._id }, // Exclude current session
    location: this.location,
    status: { $ne: 'cancelled' },
    $or: [
      // New session starts during existing session
      {
        startTime: { $lte: this.startTime },
        endTime: { $gt: this.startTime },
      },
      // New session ends during existing session
      {
        startTime: { $lt: this.endTime },
        endTime: { $gte: this.endTime },
      },
      // New session encompasses existing session
      {
        startTime: { $gte: this.startTime },
        endTime: { $lte: this.endTime },
      },
    ],
  });
  return !!clash;
};

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
