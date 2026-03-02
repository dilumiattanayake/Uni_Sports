const mongoose = require('mongoose');

/**
 * Location Schema
 * Represents physical locations where practice sessions can be held
 */
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['field', 'court', 'gym', 'pool', 'track', 'hall', 'other'],
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
    },
    address: {
      type: String,
      required: true,
    },
    facilities: [String], // e.g., ['changing rooms', 'equipment storage', 'first aid']
    // Operating hours
    operatingHours: {
      open: {
        type: String, // e.g., "06:00"
        default: '06:00',
      },
      close: {
        type: String, // e.g., "22:00"
        default: '22:00',
      },
    },
    // Availability status
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Notes or special instructions
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Location', locationSchema);
