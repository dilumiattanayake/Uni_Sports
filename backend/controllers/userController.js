const User = require('../models/User');
const Sport = require('../models/Sport');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get all users (filtered by role)
 * @route   GET /api/users?role=coach
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .populate('assignedSports', 'name category')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedSports', 'name category')
      .select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create user (Admin creates coach/student)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, specialization, phone, assignedSports } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User with this email already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      studentId,
      specialization,
      phone,
      assignedSports,
    });

    // If creating a coach, update sports with this coach
    if (role === 'coach' && assignedSports && assignedSports.length > 0) {
      await Sport.updateMany(
        { _id: { $in: assignedSports } },
        { $addToSet: { coaches: user._id } }
      );
    }

    const populatedUser = await User.findById(user._id)
      .populate('assignedSports', 'name category')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, studentId, specialization, phone, assignedSports, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (studentId) user.studentId = studentId;
    if (specialization) user.specialization = specialization;
    if (phone) user.phone = phone;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    // Handle assigned sports for coaches
    if (assignedSports && user.role === 'coach') {
      const oldSports = user.assignedSports;
      user.assignedSports = assignedSports;

      // Remove coach from old sports
      if (oldSports && oldSports.length > 0) {
        await Sport.updateMany(
          { _id: { $in: oldSports } },
          { $pull: { coaches: user._id } }
        );
      }

      // Add coach to new sports
      if (assignedSports.length > 0) {
        await Sport.updateMany(
          { _id: { $in: assignedSports } },
          { $addToSet: { coaches: user._id } }
        );
      }
    }

    await user.save();

    const populatedUser = await User.findById(user._id)
      .populate('assignedSports', 'name category')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Remove coach from sports if applicable
    if (user.role === 'coach' && user.assignedSports && user.assignedSports.length > 0) {
      await Sport.updateMany(
        { _id: { $in: user.assignedSports } },
        { $pull: { coaches: user._id } }
      );
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign sports to coach
 * @route   PUT /api/users/:id/assign-sports
 * @access  Private/Admin
 */
const assignSportsToCoach = async (req, res, next) => {
  try {
    const { sportIds } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.role !== 'coach') {
      return next(new ErrorResponse('User must be a coach', 400));
    }

    // Remove from old sports
    if (user.assignedSports && user.assignedSports.length > 0) {
      await Sport.updateMany(
        { _id: { $in: user.assignedSports } },
        { $pull: { coaches: user._id } }
      );
    }

    // Add to new sports
    user.assignedSports = sportIds;
    await user.save();

    await Sport.updateMany(
      { _id: { $in: sportIds } },
      { $addToSet: { coaches: user._id } }
    );

    const populatedUser = await User.findById(user._id)
      .populate('assignedSports', 'name category')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Sports assigned successfully',
      data: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's billing details
 * @route   GET /api/users/me/billing-details
 * @access  Private/Student
 */
const getMyBillingDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('billingDetails');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user.billingDetails || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in user's billing details
 * @route   PUT /api/users/me/billing-details
 * @access  Private/Student
 */
const updateMyBillingDetails = async (req, res, next) => {
  try {
    const { billingDetails } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    user.billingDetails = billingDetails;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Billing details updated successfully',
      data: user.billingDetails,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  assignSportsToCoach,
  getMyBillingDetails,
  updateMyBillingDetails,
};
