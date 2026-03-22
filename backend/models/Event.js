const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Event title is required'], trim: true },
    description: { type: String, required: [true, 'Event description is required'] },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: [true, 'Sport is required'] },
    
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    registrationDeadline: { type: Date, required: [true, 'Registration deadline is required'] },
    venue: { type: String, required: [true, 'Venue is required'], trim: true },
    
    // NEW: Team logic
    eventType: {
      type: String,
      enum: ['solo', 'team'],
      default: 'solo'
    },
    minTeamSize: {
      type: Number,
      min: [2, 'Minimum team size is 2']
    },
    maxTeamSize: {
      type: Number,
      min: [2, 'Maximum team size is 2']
    },

    maxParticipants: { type: Number, required: [true, 'Max capacity is required'], min: 1 },
    registrationFormUrl: { type: String, trim: true },
    
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// ─── Virtual Fields ───────────────────────────────────────────────

eventSchema.virtual('confirmedCount', {
  ref: 'Registration', 
  localField: '_id',
  foreignField: 'event',
  count: true, 
  match: { status: 'confirmed' }
});

eventSchema.virtual('isFull').get(function () {
  const count = this.confirmedCount || 0; 
  return count >= this.maxParticipants;
});

eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return now <= this.registrationDeadline && this.status === 'upcoming' && !this.isFull;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

// ─── Indexes ──────────────────────────────────────────────────────
eventSchema.index({ sport: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });

// ─── Pre-save Validation ──────────────────────────────────────────
eventSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  if (this.registrationDeadline >= this.startDate) {
    return next(new Error('Registration deadline must be before the start date'));
  }
  if (this.eventType === 'team') {
    if (!this.minTeamSize || !this.maxTeamSize) return next(new Error('Team size limits are required for team events'));
    if (this.minTeamSize > this.maxTeamSize) return next(new Error('Min team size cannot exceed max team size'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);