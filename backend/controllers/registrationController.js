const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { ErrorResponse } = require('../middleware/errorHandler');
const User = require('../models/User'); // Adjust path to your User model

/**
 * @desc    Submit a new registration (Individual or Team)
 * @route   POST /api/events/:eventId/registrations
 * @access  Private/Student
 */
const createRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { registrationType, teamName, teamMembers } = req.body;
    const studentId = req.user.id || req.user._id;

    // 1. Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // 2. Check if registration deadline has passed
    if (new Date() > new Date(event.registrationDeadline)) {
      return next(new ErrorResponse('Registration deadline has passed', 400));
    }
    if (event.status !== 'upcoming') {
      return next(new ErrorResponse('Event is no longer accepting registrations', 400));
    }

    // 3. Check if the primary student is already registered for this event
    const existingRegistration = await Registration.findOne({ 
      event: eventId, 
      primaryStudent: studentId 
    });
    
    if (existingRegistration) {
      return next(new ErrorResponse('You have already registered for this event', 400));
    }

    // Optional: Check if the student is listed as a teamMember in someone else's registration
    const partOfAnotherTeam = await Registration.findOne({
      event: eventId,
      teamMembers: studentId
    });

    if (partOfAnotherTeam) {
      return next(new ErrorResponse('You are already registered as a team member in another team', 400));
    }

    // 4. Calculate Capacity & Status (Confirmed vs Waitlisted)
    // Here we count total *registrations* (1 individual = 1 slot, 1 team = 1 slot). 
    // If you want to count total heads, you would aggregate the size of the teamMembers arrays.
    const confirmedCount = await Registration.countDocuments({ 
      event: eventId, 
      status: 'confirmed' 
    });

    const status = confirmedCount < event.maxParticipants ? 'confirmed' : 'waitlisted';

    // 5. Create the Registration Object
    const registrationData = {
      event: eventId,
      primaryStudent: studentId,
      registrationType,
      status
    };

    if (registrationType === 'team') {
      if (!teamName) {
        return next(new ErrorResponse('Team name is required for team registrations', 400));
      }
      registrationData.teamName = teamName;
      registrationData.teamMembers = teamMembers || [];
    }

    // 6. Save to Database
    const newRegistration = await Registration.create(registrationData);

    res.status(201).json({
      success: true,
      message: `Successfully registered. Status: ${status}`,
      data: newRegistration
    });

  } catch (error) {
    // Catch Mongoose duplicate key error specifically
    if (error.code === 11000) {
      return next(new ErrorResponse('You are already registered for this event', 400));
    }
    next(error);
  }
};

/**
 * @desc    Get all registrations for a specific event (Admin view)
 * @route   GET /api/events/:eventId/registrations
 * @access  Private/Admin
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('primaryStudent', 'name email')
      .populate('teamMembers', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in student's registrations
 * @route   GET /api/registrations/my-registrations
 * @access  Private/Student
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;

    // Find registrations where student is captain OR a team member
    const registrations = await Registration.find({
      $or: [
        { primaryStudent: studentId },
        { teamMembers: studentId }
      ]
    }).populate('event', 'title startDate venue');

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search for a student by Student ID or Email
 * @route   GET /api/users/search-student?query=...
 * @access  Private (Logged-in users only)
 */
const searchStudent = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return next(new ErrorResponse('Please provide a search query', 400));
    }

    // Search for a user with the role of 'student' matching the email or studentId
    // Adjust 'studentId' if your schema uses a different field name for the university ID
    const student = await User.findOne({
      role: 'student',
      $or: [
        { email: { $regex: new RegExp(`^${query}$`, 'i') } },
        { studentId: { $regex: new RegExp(`^${query}$`, 'i') } } 
      ]
    }).select('_id name email studentId'); // Only return safe, non-sensitive fields

    if (!student) {
      return next(new ErrorResponse('No student found with that ID or Email', 404));
    }

    // Prevent the user from searching for and adding themselves as a team member
    const currentUserId = req.user.id || req.user._id;
    if (student._id.toString() === currentUserId.toString()) {
      return next(new ErrorResponse('You are automatically the team captain. You cannot add yourself as a member.', 400));
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createRegistration,
  getEventRegistrations,
  getMyRegistrations,
  searchStudent
};