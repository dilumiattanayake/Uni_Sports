const Location = require('../models/Location');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get all locations
 * @route   GET /api/locations
 * @access  Public
 */
const getLocations = async (req, res, next) => {
  try {
    const { type, isAvailable, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (type) {
      query.type = type;
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    const locations = await Location.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Location.countDocuments(query);

    res.status(200).json({
      success: true,
      count: locations.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single location
 * @route   GET /api/locations/:id
 * @access  Public
 */
const getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return next(new ErrorResponse('Location not found', 404));
    }

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create location
 * @route   POST /api/locations
 * @access  Private/Admin
 */
const createLocation = async (req, res, next) => {
  try {
    const { name, type, capacity, address, facilities, operatingHours, notes } = req.body;

    // Check if location already exists
    const locationExists = await Location.findOne({ name });
    if (locationExists) {
      return next(new ErrorResponse('Location with this name already exists', 400));
    }

    // Create location
    const location = await Location.create({
      name,
      type,
      capacity,
      address,
      facilities,
      operatingHours,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update location
 * @route   PUT /api/locations/:id
 * @access  Private/Admin
 */
const updateLocation = async (req, res, next) => {
  try {
    const { name, type, capacity, address, facilities, operatingHours, isAvailable, notes } =
      req.body;

    let location = await Location.findById(req.params.id);
    if (!location) {
      return next(new ErrorResponse('Location not found', 404));
    }

    // Update location
    location = await Location.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        capacity,
        address,
        facilities,
        operatingHours,
        isAvailable,
        notes,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete location
 * @route   DELETE /api/locations/:id
 * @access  Private/Admin
 */
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return next(new ErrorResponse('Location not found', 404));
    }

    // TODO: Check if location has active sessions before deleting
    // This can be added in future iterations

    await location.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get location types
 * @route   GET /api/locations/types/list
 * @access  Public
 */
const getLocationTypes = async (req, res, next) => {
  try {
    const types = ['field', 'court', 'gym', 'pool', 'track', 'hall', 'other'];
    
    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationTypes,
};
