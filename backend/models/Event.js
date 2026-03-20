
const mongoose = require('mongoose');

/**
 * Event Schema
 * Represents sports events/tournaments managed by the university
 */
const eventSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
   

    // Linked Sport
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sport',
      required: [true, 'Sport is required'],
    },

    // Dates
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },

    // Location
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },

    // Capacity
    maxParticipants: {
      type: Number,
      required: [true, 'Max participants is required'],
      min: [1, 'Max participants must be at least 1'],
    },

    // Google Form link for student registration (per event/sport)
    registrationFormUrl: {
      type: String,
      trim: true,
    },

    // Registered students
    registrations: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'waitlisted', 'cancelled'],
          default: 'pending',
        },
      },
    ],

    // Event status
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },

    // Admin who created the event
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Optional banner image
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Virtual Fields ───────────────────────────────────────────────

// Total number of registrations
eventSchema.virtual('totalRegistrations').get(function () {
  return this.registrations.length;
});

// Number of confirmed registrations
eventSchema.virtual('confirmedCount').get(function () {
  return this.registrations.filter((r) => r.status === 'confirmed').length;
});

// Check if event is full
eventSchema.virtual('isFull').get(function () {
  const confirmed = this.registrations.filter((r) => r.status === 'confirmed').length;
  return confirmed >= this.maxParticipants;
});

// Check if registration is still open
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return (
    now <= this.registrationDeadline &&
    this.status === 'upcoming' &&
    !this.isFull
  );
});

// Include virtuals when converting to JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// ─── Indexes ──────────────────────────────────────────────────────

eventSchema.index({ sport: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ 'registrations.student': 1 });

// ─── Pre-save Validation ──────────────────────────────────────────

// End date must be after start date
eventSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  if (this.registrationDeadline >= this.startDate) {
    return next(new Error('Registration deadline must be before the start date'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);