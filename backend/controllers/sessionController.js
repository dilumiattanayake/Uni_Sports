const PracticeSession = require('../models/PracticeSession');
const User = require('../models/User');
const Sport = require('../models/Sport');
const Location = require('../models/Location');
const { ErrorResponse } = require('../middleware/errorHandler');
const clashDetectionService = require('../services/clashDetectionService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');

/**
 * @desc    Get all practice sessions
 * @route   GET /api/sessions
 * @access  Public
 */
const getSessions = async (req, res, next) => {
  try {
    const {
      sport,
      coach,
      location,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = {};
    if (sport) query.sport = sport;
    if (coach) query.coach = coach;
    if (location) query.location = location;
    if (status) query.status = status;
    
    // Date range filtering
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    // Execute query
    const sessions = await PracticeSession.find(query)
      .populate('sport', 'name category imageUrl')
      .populate('coach', 'name email specialization')
      .populate('location', 'name type address')
      .populate('enrolledStudents.student', 'name email studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startTime: 1 });

    const total = await PracticeSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single session
 * @route   GET /api/sessions/:id
 * @access  Public
 */
const getSession = async (req, res, next) => {
  try {
    const session = await PracticeSession.findById(req.params.id)
      .populate('sport', 'name category description imageUrl')
      .populate('coach', 'name email phone specialization')
      .populate('location', 'name type address capacity facilities')
      .populate('enrolledStudents.student', 'name email studentId phone');

    if (!session) {
      return next(new ErrorResponse('Session not found', 404));
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create practice session
 * @route   POST /api/sessions
 * @access  Private/Coach
 */
const createSession = async (req, res, next) => {
  try {
    const {
      sport,
      location,
      startTime,
      endTime,
      title,
      description,
      maxParticipants,
      isRecurring,
      dayOfWeek,
    } = req.body;

    const coachId = req.user.id;

    // Validate timing
    const timingValidation = clashDetectionService.validateSessionTiming(startTime, endTime);
    if (!timingValidation.isValid) {
      return next(new ErrorResponse(timingValidation.message, 400));
    }

    // Check for location clash
    const locationClash = await clashDetectionService.checkLocationClash(
      location,
      new Date(startTime),
      new Date(endTime)
    );
    if (locationClash.hasClash) {
      return next(new ErrorResponse(`⚠ Time Conflict Detected: ${locationClash.message}`, 409));
    }

    // Check for coach clash
    const coachClash = await clashDetectionService.checkCoachClash(
      coachId,
      new Date(startTime),
      new Date(endTime)
    );
    if (coachClash.hasClash) {
      return next(new ErrorResponse(`⚠ Time Conflict Detected: ${coachClash.message}`, 409));
    }

    // Verify coach is assigned to the sport
    const coachUser = await User.findById(coachId);
    if (!coachUser.assignedSports.includes(sport)) {
      return next(new ErrorResponse('You are not assigned to this sport', 403));
    }

    // Create session
    const session = await PracticeSession.create({
      sport,
      coach: coachId,
      location,
      startTime,
      endTime,
      title,
      description,
      maxParticipants,
      isRecurring,
      dayOfWeek,
    });

    const populatedSession = await PracticeSession.findById(session._id)
      .populate('sport', 'name category')
      .populate('coach', 'name email')
      .populate('location', 'name type address');

    if (session.enrolledStudents.length > 0) {
      const studentIds = session.enrolledStudents.map((enrollment) => enrollment.student);
      await notificationService.notifyNewSessionAvailable(studentIds, {
        sessionId: session._id,
        sportId: session.sport,
        sport: populatedSession.sport.name,
        startTime: new Date(session.startTime).toLocaleString(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Practice session created successfully',
      data: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update practice session
 * @route   PUT /api/sessions/:id
 * @access  Private/Coach (own sessions) or Admin
 */
const updateSession = async (req, res, next) => {
  try {
    const {
      location,
      startTime,
      endTime,
      title,
      description,
      maxParticipants,
      status,
      cancellationReason,
    } = req.body;

    let session = await PracticeSession.findById(req.params.id);
    if (!session) {
      return next(new ErrorResponse('Session not found', 404));
    }

    // Check authorization (coach can only update own sessions)
    if (req.user.role === 'coach' && session.coach.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this session', 403));
    }

    // Track if time changed for notifications
    const timeChanged =
      (startTime && new Date(startTime).getTime() !== session.startTime.getTime()) ||
      (endTime && new Date(endTime).getTime() !== session.endTime.getTime());

    // Validate new timing if provided
    if (startTime || endTime) {
      const newStart = startTime ? new Date(startTime) : session.startTime;
      const newEnd = endTime ? new Date(endTime) : session.endTime;

      const timingValidation = clashDetectionService.validateSessionTiming(newStart, newEnd);
      if (!timingValidation.isValid) {
        return next(new ErrorResponse(timingValidation.message, 400));
      }

      // Check for location clash
      const newLocation = location || session.location;
      const locationClash = await clashDetectionService.checkLocationClash(
        newLocation,
        newStart,
        newEnd,
        session._id
      );
      if (locationClash.hasClash) {
        return next(new ErrorResponse(`⚠ Time Conflict Detected: ${locationClash.message}`, 409));
      }

      // Check for coach clash
      const coachClash = await clashDetectionService.checkCoachClash(
        session.coach,
        newStart,
        newEnd,
        session._id
      );
      if (coachClash.hasClash) {
        return next(new ErrorResponse(`⚠ Time Conflict Detected: ${coachClash.message}`, 409));
      }

      if (session.enrolledStudents.length > 0) {
        const enrolledIds = session.enrolledStudents.map((enrollment) => enrollment.student.toString());
        for (const studentId of enrolledIds) {
          const studentClash = await clashDetectionService.checkStudentClash(
            studentId,
            newStart,
            newEnd,
            session._id
          );

          if (studentClash.hasClash) {
            return next(
              new ErrorResponse(
                `⚠ Time Conflict Detected: One or more enrolled students have overlapping sessions.`,
                409
              )
            );
          }
        }
      }
    }

    // Update session
    if (location) session.location = location;
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (title) session.title = title;
    if (description) session.description = description;
    if (maxParticipants) session.maxParticipants = maxParticipants;
    if (status) session.status = status;
    if (cancellationReason) session.cancellationReason = cancellationReason;

    await session.save();

    // Notify enrolled students if time changed
    if (timeChanged && session.enrolledStudents.length > 0) {
      const populatedSession = await PracticeSession.findById(session._id)
        .populate('sport', 'name')
        .populate('coach', 'name')
        .populate('location', 'name');

      const studentIds = session.enrolledStudents.map((enrollment) => enrollment.student);
      
      // Send notifications
      await notificationService.notifySessionTimeChange(studentIds, {
        sessionId: session._id,
        sportId: session.sport._id,
        sport: populatedSession.sport.name,
        newTime: `${new Date(session.startTime).toLocaleString()} - ${new Date(session.endTime).toLocaleString()}`,
      });

      // Send emails
      const students = await User.find({ _id: { $in: studentIds } });
      for (const student of students) {
        await emailService.sendSessionTimeChangeEmail(student.email, student.name, {
          sport: populatedSession.sport.name,
          coach: populatedSession.coach.name,
          newStartTime: new Date(session.startTime).toLocaleString(),
          newEndTime: new Date(session.endTime).toLocaleString(),
          location: populatedSession.location.name,
        });
      }
    }

    const updatedSession = await PracticeSession.findById(session._id)
      .populate('sport', 'name category')
      .populate('coach', 'name email')
      .populate('location', 'name type address')
      .populate('enrolledStudents.student', 'name email');

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Cancel practice session
 * @route   DELETE /api/sessions/:id
 * @access  Private/Coach (own sessions) or Admin
 */
const deleteSession = async (req, res, next) => {
  try {
    const session = await PracticeSession.findById(req.params.id)
      .populate('sport', 'name')
      .populate('coach', 'name')
      .populate('location', 'name');

    if (!session) {
      return next(new ErrorResponse('Session not found', 404));
    }

    // Check authorization
    if (req.user.role === 'coach' && session.coach._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this session', 403));
    }

    // Notify enrolled students
    if (session.enrolledStudents.length > 0) {
      const studentIds = session.enrolledStudents.map((enrollment) => enrollment.student);
      
      await notificationService.notifySessionCancellation(studentIds, {
        sessionId: session._id,
        sportId: session.sport._id,
        sport: session.sport.name,
      }, session.cancellationReason);

      // Send emails
      const students = await User.find({ _id: { $in: studentIds } });
      for (const student of students) {
        await emailService.sendSessionCancellationEmail(student.email, student.name, {
          sport: session.sport.name,
          coach: session.coach.name,
          startTime: new Date(session.startTime).toLocaleString(),
          endTime: new Date(session.endTime).toLocaleString(),
          location: session.location.name,
        }, session.cancellationReason);
      }
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get coach's sessions
 * @route   GET /api/sessions/coach/my-sessions
 * @access  Private/Coach
 */
const getMyCoachSessions = async (req, res, next) => {
  try {
    const { status, startDate, page = 1, limit = 10 } = req.query;

    const query = { coach: req.user.id };
    if (status) query.status = status;
    if (startDate) {
      query.startTime = { $gte: new Date(startDate) };
    }

    const sessions = await PracticeSession.find(query)
      .populate('sport', 'name category')
      .populate('location', 'name type')
      .populate('enrolledStudents.student', 'name email studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startTime: 1 });

    const total = await PracticeSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's enrolled sessions
 * @route   GET /api/sessions/student/my-sessions
 * @access  Private/Student
 */
const getMyStudentSessions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      'enrolledStudents.student': req.user.id,
    };
    if (status) query.status = status;

    const sessions = await PracticeSession.find(query)
      .populate('sport', 'name category imageUrl')
      .populate('coach', 'name email phone')
      .populate('location', 'name type address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startTime: 1 });

    const total = await PracticeSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getMyCoachSessions,
  getMyStudentSessions,
};
