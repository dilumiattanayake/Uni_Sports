const mongoose = require('mongoose');

/**
 * Sport Schema
 * Represents different sports offered by the university
 */
const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sport name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['indoor', 'outdoor', 'water', 'combat', 'team', 'individual'],
      required: true,
    },
    // Assigned coaches for this sport
    coaches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Equipment or requirements
    equipmentNeeded: [String],
    // Max participants per session (optional)
    maxParticipants: {
      type: Number,
      default: 20,
    },
    // Image URL
    imageUrl: {
      type: String,
    },
    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sport', sportSchema);
