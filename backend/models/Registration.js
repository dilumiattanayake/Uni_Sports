const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    // The event being registered for
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required']
    },
    
    // The student making the registration (Solo athlete or Team Captain)
    primaryStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Primary student ID is required']
    },

    // Type of registration
    registrationType: {
      type: String,
      enum: ['individual', 'team'], // 'solo' and 'individual' are treated as the same
      required: [true, 'Registration type is required']
    },

    // ─── TEAM SPECIFIC FIELDS ──────────────────────────────
    teamName: {
      type: String,
      trim: true,
      required: function() {
        return this.registrationType === 'team';
      }
    },
    
    // Array of other student IDs in the team (excluding the primaryStudent/captain)
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // ────────────────────────────────────────────────────────

    // Registration Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'waitlisted', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Prevent the same student from registering for the same event twice as the primary registrant
registrationSchema.index({ event: 1, primaryStudent: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);