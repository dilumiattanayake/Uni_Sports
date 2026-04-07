const JoinRequest = require('../models/JoinRequest');
const PracticeSession = require('../models/PracticeSession');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const clashDetectionService = require('../services/clashDetectionService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');

/**
 * @desc    Get all join requests (for coach/admin)
 * @route   GET /api/join-requests
 * @access  Private/Coach, Admin
 */
const getJoinRequests = async (req, res, next) => {
  try {
    const { status, session, page = 1, limit = 10 } = req.query;

    // Build query based on user role
    const query = {};
    if (req.user.role === 'coach') {
      query.coach = req.user.id;
    }
    if (status) query.status = status;
    if (session) query.session = session;

    const requests = await JoinRequest.find(query)
      .populate('session', 'title startTime endTime maxParticipants')
      .populate('student', 'name email studentId')
      .populate('coach', 'name email')
      .populate({
        path: 'session',
        populate: { path: 'sport', select: 'name category' },
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await JoinRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single join request
 * @route   GET /api/join-requests/:id
 * @access  Private
 */
const getJoinRequest = async (req, res, next) => {
  try {
    const request = await JoinRequest.findById(req.params.id)
      .populate('session', 'title startTime endTime maxParticipants')
      .populate('student', 'name email studentId phone')
      .populate('coach', 'name email')
      .populate({
        path: 'session',
        populate: [
          { path: 'sport', select: 'name category' },
          { path: 'location', select: 'name type address' },
        ],
      });

    if (!request) {
      return next(new ErrorResponse('Join request not found', 404));
    }

    // Authorization check
    if (
      req.user.role === 'student' &&
      request.student._id.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to view this request', 403));
    }
    if (
      req.user.role === 'coach' &&
      request.coach._id.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to view this request', 403));
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create join request (student applies to join session)
 * @route   POST /api/join-requests
 * @access  Private/Student
 */
const createJoinRequest = async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;
    const studentId = req.user.id;

    // Check if session exists
    const session = await PracticeSession.findById(sessionId)
      .populate('sport', 'name')
      .populate('coach');

    if (!session) {
      return next(new ErrorResponse('Session not found', 404));
    }

    // Check if session is full
    if (session.enrolledStudents.length >= session.maxParticipants) {
      return next(new ErrorResponse('Session is full', 400));
    }

    // Session must have a coach assigned to process join requests
    if (!session.coach) {
      return next(
        new ErrorResponse(
          'This session has no coach assigned yet. Please try another session.',
          400
        )
      );
    }

    // Check if student is already enrolled
    const alreadyEnrolled = session.enrolledStudents.some(
      (enrollment) => enrollment.student.toString() === studentId
    );
    if (alreadyEnrolled) {
      return next(new ErrorResponse('You are already enrolled in this session', 400));
    }

    // Check for existing join request
    const existingRequest = await JoinRequest.findOne({
      session: sessionId,
      student: studentId,
    });
    if (existingRequest) {
      return next(
        new ErrorResponse(
          `You already have a ${existingRequest.status} request for this session`,
          400
        )
      );
    }

    // Check for time clash with student's existing sessions
    const clash = await clashDetectionService.checkStudentClash(
      studentId,
      session.startTime,
      session.endTime
    );
    if (clash.hasClash) {
      return next(new ErrorResponse(clash.message, 409));
    }

    // Create join request
    const joinRequest = await JoinRequest.create({
      session: sessionId,
      student: studentId,
      coach: session.coach._id || session.coach,
      message,
    });

    const populatedRequest = await JoinRequest.findById(joinRequest._id)
      .populate('session', 'title startTime endTime')
      .populate('student', 'name email')
      .populate('coach', 'name email')
      .populate({
        path: 'session',
        populate: { path: 'sport', select: 'name' },
      });

    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully',
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update join request status (accept/reject)
 * @route   PUT /api/join-requests/:id
 * @access  Private/Coach
 */
const updateJoinRequestStatus = async (req, res, next) => {
  try {
    const { status, responseMessage } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status. Use "accepted" or "rejected"', 400));
    }

    const joinRequest = await JoinRequest.findById(req.params.id)
      .populate('session')
      .populate('student', 'name email')
      .populate({
        path: 'session',
        populate: [
          { path: 'sport', select: 'name' },
          { path: 'coach', select: 'name' },
          { path: 'location', select: 'name' },
        ],
      });

    if (!joinRequest) {
      return next(new ErrorResponse('Join request not found', 404));
    }

    // Check authorization
    if (joinRequest.coach.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this request', 403));
    }

    // Check if already processed
    if (joinRequest.status !== 'pending') {
      return next(
        new ErrorResponse(
          `This request has already been ${joinRequest.status}`,
          400
        )
      );
    }

    // If accepting, check session capacity and time clash
    if (status === 'accepted') {
      const session = joinRequest.session;

      // Check capacity
      if (session.enrolledStudents.length >= session.maxParticipants) {
        return next(new ErrorResponse('Session is now full', 400));
      }

      // Check for time clash
      const clash = await clashDetectionService.checkStudentClash(
        joinRequest.student._id,
        session.startTime,
        session.endTime
      );
      if (clash.hasClash) {
        return next(
          new ErrorResponse(
            `Cannot accept: ${clash.message}. Please reject this request.`,
            409
          )
        );
      }

      // Add student to session
      session.enrolledStudents.push({
        student: joinRequest.student._id,
        enrolledAt: new Date(),
      });
      await session.save();
    }

    // Update join request
    joinRequest.status = status;
    joinRequest.responseMessage = responseMessage;
    joinRequest.decidedAt = new Date();
    await joinRequest.save();

    // Send notification and email
    await notificationService.notifyJoinRequestDecision(
      joinRequest.student._id,
      status,
      {
        sessionId: joinRequest.session._id,
        sportId: joinRequest.session.sport._id,
        sport: joinRequest.session.sport.name,
      }
    );

    await emailService.sendJoinRequestDecisionEmail(
      joinRequest.student.email,
      joinRequest.student.name,
      status,
      {
        sport: joinRequest.session.sport.name,
        coach: joinRequest.session.coach.name,
        startTime: new Date(joinRequest.session.startTime).toLocaleString(),
        endTime: new Date(joinRequest.session.endTime).toLocaleString(),
        location: joinRequest.session.location.name,
        responseMessage: responseMessage,
      }
    );

    const updatedRequest = await JoinRequest.findById(joinRequest._id)
      .populate('session', 'title startTime endTime')
      .populate('student', 'name email')
      .populate({
        path: 'session',
        populate: { path: 'sport', select: 'name' },
      });

    res.status(200).json({
      success: true,
      message: `Join request ${status} successfully`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete join request
 * @route   DELETE /api/join-requests/:id
 * @access  Private/Student (own requests) or Admin
 */
const deleteJoinRequest = async (req, res, next) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id);

    if (!joinRequest) {
      return next(new ErrorResponse('Join request not found', 404));
    }

    // Check authorization
    if (
      req.user.role === 'student' &&
      joinRequest.student.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to delete this request', 403));
    }

    // Don't allow deletion if accepted
    if (joinRequest.status === 'accepted') {
      return next(
        new ErrorResponse('Cannot delete an accepted request', 400)
      );
    }

    await joinRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Join request deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my join requests (student)
 * @route   GET /api/join-requests/student/my-requests
 * @access  Private/Student
 */
const getMyJoinRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { student: req.user.id };
    if (status) query.status = status;

    const requests = await JoinRequest.find(query)
      .populate('session', 'title startTime endTime maxParticipants')
      .populate('coach', 'name email')
      .populate({
        path: 'session',
        populate: [
          { path: 'sport', select: 'name category imageUrl' },
          { path: 'location', select: 'name type address' },
        ],
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await JoinRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get join requests for coach's sessions
 * @route   GET /api/join-requests/coach/my-requests
 * @access  Private/Coach
 */
const getMyCoachRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { coach: req.user.id };
    if (status) query.status = status;

    const requests = await JoinRequest.find(query)
      .populate('session', 'title startTime endTime maxParticipants')
      .populate('student', 'name email studentId')
      .populate({
        path: 'session',
        populate: [
          { path: 'sport', select: 'name category' },
          { path: 'location', select: 'name type' },
        ],
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await JoinRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJoinRequests,
  getJoinRequest,
  createJoinRequest,
  updateJoinRequestStatus,
  deleteJoinRequest,
  getMyJoinRequests,
  getMyCoachRequests,
};
