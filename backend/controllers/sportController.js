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

/**
 * @desc    Get all coaches assigned to a sport
 * @route   GET /api/sports/:id/coaches
 * @access  Public
 */
const getSportCoaches = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id)
      .populate({
        path: 'coaches',
        select: 'name email phone specialization isActive',
      });

    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    res.status(200).json({
      success: true,
      count: sport.coaches.length,
      data: sport.coaches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available coaches (all coaches not assigned to this sport)
 * @route   GET /api/sports/:id/available-coaches
 * @access  Private/Admin
 */
const getAvailableCoaches = async (req, res, next) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    // Get all active coaches
    const allCoaches = await User.find({
      role: 'coach',
      isActive: true,
    }).select('name email phone specialization assignedSports');

    // Filter out coaches already assigned to this sport
    const availableCoaches = allCoaches.filter(
      coach => !sport.coaches.includes(coach._id)
    );

    res.status(200).json({
      success: true,
      count: availableCoaches.length,
      data: availableCoaches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a coach to a sport
 * @route   POST /api/sports/:id/coaches/:coachId
 * @access  Private/Admin
 */
const assignCoachToSport = async (req, res, next) => {
  try {
    const { id: sportId, coachId } = req.params;

    // Validate sport exists
    const sport = await Sport.findById(sportId);
    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    // Validate coach exists and is active
    const coach = await User.findById(coachId);
    if (!coach) {
      return next(new ErrorResponse('Coach not found', 404));
    }

    if (coach.role !== 'coach') {
      return next(new ErrorResponse('User is not a coach', 400));
    }

    if (!coach.isActive) {
      return next(new ErrorResponse('Coach is not active', 400));
    }

    // Check if coach is already assigned
    if (sport.coaches.includes(coachId)) {
      return next(new ErrorResponse('Coach is already assigned to this sport', 400));
    }

    // Assign coach to sport
    sport.coaches.push(coachId);
    await sport.save();

    // Update coach's assigned sports
    await User.findByIdAndUpdate(
      coachId,
      { $addToSet: { assignedSports: sportId } },
      { new: true }
    );

    // Create notification for the coach
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: coachId,
      type: 'coach_assigned_to_sport',
      title: `Assigned to ${sport.name}`,
      message: `You have been assigned to coach ${sport.name}. ${sport.description ? `Description: ${sport.description}` : ''}`,
      relatedSport: sportId,
      isRead: false,
    });

    // Populate and return updated sport
    const updatedSport = await Sport.findById(sportId)
      .populate('coaches', 'name email phone specialization');

    res.status(200).json({
      success: true,
      message: `Coach assigned to ${sport.name} successfully`,
      data: updatedSport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a coach from a sport
 * @route   DELETE /api/sports/:id/coaches/:coachId
 * @access  Private/Admin
 */
const removeCoachFromSport = async (req, res, next) => {
  try {
    const { id: sportId, coachId } = req.params;

    // Validate sport exists
    const sport = await Sport.findById(sportId);
    if (!sport) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    // Check if coach is assigned to this sport
    if (!sport.coaches.includes(coachId)) {
      return next(new ErrorResponse('Coach is not assigned to this sport', 400));
    }

    // Remove coach from sport
    sport.coaches = sport.coaches.filter(id => id.toString() !== coachId);
    await sport.save();

    // Remove sport from coach's assigned sports
    await User.findByIdAndUpdate(
      coachId,
      { $pull: { assignedSports: sportId } },
      { new: true }
    );

    // Populate and return updated sport
    const updatedSport = await Sport.findById(sportId)
      .populate('coaches', 'name email phone specialization');

    res.status(200).json({
      success: true,
      message: 'Coach removed from sport successfully',
      data: updatedSport,
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
  getSportCoaches,
  getAvailableCoaches,
  assignCoachToSport,
  removeCoachFromSport,
};
