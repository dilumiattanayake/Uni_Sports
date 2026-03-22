const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Supports Admin, Coach, and Student roles
 * Designed to be extensible for other modules (Events, Payments, etc.)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
   email: {
  type: String,
  required: [true, 'Email is required'],
  unique: true,
  lowercase: true,
  match: [
    /^[a-zA-Z0-9._%+-]+@my\.sliit\.lk$/,
    'Only SLIIT university emails (@my.sliit.lk) are allowed'
  ]
},
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'coach', 'student'],
      default: 'student',
    },
    // Sports-specific fields
    assignedSports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sport',
      },
    ],
    // Student-specific fields
    studentId: {
      type: String,
      sparse: true, // Allows null for non-students
    },
    // Coach-specific fields
    specialization: {
      type: String,
    },
    // Contact info
    phone: {
      type: String,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Placeholder: Future modules can add fields like
    // - paymentHistory (Payment Module)
    // - registeredEvents (Event Module)
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
