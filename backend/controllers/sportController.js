const Sport = require('../models/Sport');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get all sports
 * @route   GET /api/sports
 * @access  Public
 */
const getSports = async (req, res, next) => {
  try {
    const { category, search, isActive, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query
    const sports = await Sport.find(query)
      .populate('coaches', 'name email specialization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Sport.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sports.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: sports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single sport
 * @route   GET /api/sports/:id
 * @access  Public
 */
const getSport = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id)
      .populate('coaches', 'name email specialization phone');

    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    res.status(200).json({
      success: true,
      data: sport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create sport
 * @route   POST /api/sports
 * @access  Private/Admin
 */
const createSport = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      coaches,
      equipmentNeeded,
      maxParticipants,
      imageUrl,
    } = req.body;

    // Check if sport already exists
    const sportExists = await Sport.findOne({ name });
    if (sportExists) {
      return next(new ErrorResponse('Sport with this name already exists', 400));
    }

    // Create sport
    const sport = await Sport.create({
      name,
      description,
      category,
      coaches,
      equipmentNeeded,
      maxParticipants,
      imageUrl,
    });

    // Update coaches' assignedSports
    if (coaches && coaches.length > 0) {
      await User.updateMany(
        { _id: { $in: coaches }, role: 'coach' },
        { $addToSet: { assignedSports: sport._id } }
      );
    }

    const populatedSport = await Sport.findById(sport._id)
      .populate('coaches', 'name email specialization');

    res.status(201).json({
      success: true,
      message: 'Sport created successfully',
      data: populatedSport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update sport
 * @route   PUT /api/sports/:id
 * @access  Private/Admin
 */
const updateSport = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      coaches,
      equipmentNeeded,
      maxParticipants,
      imageUrl,
      isActive,
    } = req.body;

    let sport = await Sport.findById(req.params.id);
    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    // Handle coach reassignment
    if (coaches) {
      const oldCoaches = sport.coaches;

      // Remove sport from old coaches
      if (oldCoaches && oldCoaches.length > 0) {
        await User.updateMany(
          { _id: { $in: oldCoaches } },
          { $pull: { assignedSports: sport._id } }
        );
      }

      // Add sport to new coaches
      if (coaches.length > 0) {
        await User.updateMany(
          { _id: { $in: coaches }, role: 'coach' },
          { $addToSet: { assignedSports: sport._id } }
        );
      }
    }

    // Update sport
    sport = await Sport.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        coaches,
        equipmentNeeded,
        maxParticipants,
        imageUrl,
        isActive,
      },
      { new: true, runValidators: true }
    ).populate('coaches', 'name email specialization');

    res.status(200).json({
      success: true,
      message: 'Sport updated successfully',
      data: sport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete sport
 * @route   DELETE /api/sports/:id
 * @access  Private/Admin
 */
const deleteSport = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    // Remove sport from coaches
    if (sport.coaches && sport.coaches.length > 0) {
      await User.updateMany(
        { _id: { $in: sport.coaches } },
        { $pull: { assignedSports: sport._id } }
      );
    }

    await sport.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sport deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sport categories
 * @route   GET /api/sports/categories/list
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = ['indoor', 'outdoor', 'water', 'combat', 'team', 'individual'];
    
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSports,
  getSport,
  createSport,
  updateSport,
  deleteSport,
  getCategories,
};
