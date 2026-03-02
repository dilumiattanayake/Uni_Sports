const { body, query, param } = require('express-validator');

/**
 * Validation Rules for different endpoints
 * Used with express-validator
 */

// Auth validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'coach', 'student'])
    .withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Sport validation rules
const createSportValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Sport name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Sport name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .isIn(['indoor', 'outdoor', 'water', 'combat', 'team', 'individual'])
    .withMessage('Invalid category'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max participants must be between 1 and 100'),
];

// Location validation rules
const createLocationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Location name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2 and 100 characters'),
  body('type')
    .isIn(['field', 'court', 'gym', 'pool', 'track', 'hall', 'other'])
    .withMessage('Invalid location type'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive number'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
];

// Session validation rules
const createSessionValidation = [
  body('sport').notEmpty().withMessage('Sport is required').isMongoId().withMessage('Invalid sport ID'),
  body('location').notEmpty().withMessage('Location is required').isMongoId().withMessage('Invalid location ID'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max participants must be between 1 and 100'),
];

// Join Request validation rules
const createJoinRequestValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters'),
];

const updateJoinRequestValidation = [
  body('status')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be "accepted" or "rejected"'),
  body('responseMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response message must not exceed 500 characters'),
];

// User validation rules
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'coach', 'student'])
    .withMessage('Invalid role'),
];

// ID parameter validation
const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

module.exports = {
  registerValidation,
  loginValidation,
  createSportValidation,
  createLocationValidation,
  createSessionValidation,
  createJoinRequestValidation,
  updateJoinRequestValidation,
  createUserValidation,
  mongoIdValidation,
};
