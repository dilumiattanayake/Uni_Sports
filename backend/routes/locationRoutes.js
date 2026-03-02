const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const locationController = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @route   GET /api/locations/types/list
 * @desc    Get location types
 * @access  Public
 */
router.get('/types/list', locationController.getLocationTypes);

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 * @access  Public
 */
router.get('/', locationController.getLocations);

/**
 * @route   GET /api/locations/:id
 * @desc    Get single location
 * @access  Public
 */
router.get('/:id', locationController.getLocation);

/**
 * @route   POST /api/locations
 * @desc    Create location
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Location name is required'),
    body('type')
      .isIn(['field', 'court', 'gym', 'pool', 'track', 'hall', 'other'])
      .withMessage('Invalid location type'),
    body('capacity')
      .isInt({ min: 1 })
      .withMessage('Capacity must be a positive number'),
    body('address').trim().notEmpty().withMessage('Address is required'),
  ],
  validate,
  locationController.createLocation
);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update location
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), locationController.updateLocation);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete location
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), locationController.deleteLocation);

module.exports = router;
