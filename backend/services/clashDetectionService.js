const PracticeSession = require('../models/PracticeSession');

/**
 * Clash Detection Service
 * Handles logic for detecting schedule conflicts
 */

/**
 * Check if location has time clash
 * Prevents double-booking of locations
 */
const checkLocationClash = async (locationId, startTime, endTime, excludeSessionId = null) => {
  try {
    const query = {
      location: locationId,
      status: { $ne: 'cancelled' },
      $or: [
        // New session starts during existing session
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        // New session ends during existing session
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        // New session encompasses existing session
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ],
    };

    // Exclude current session when updating
    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }

    const clash = await PracticeSession.findOne(query)
      .populate('sport', 'name')
      .populate('coach', 'name');

    if (clash) {
      return {
        hasClash: true,
        clashingSession: clash,
        message: `Location is already booked for ${clash.sport.name} from ${clash.startTime} to ${clash.endTime}`,
      };
    }

    return { hasClash: false };
  } catch (error) {
    console.error('Check location clash error:', error);
    throw error;
  }
};

/**
 * Check if student has time clash
 * Prevents students from enrolling in overlapping sessions
 */
const checkStudentClash = async (studentId, startTime, endTime, excludeSessionId = null) => {
  try {
    const query = {
      'enrolledStudents.student': studentId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ],
    };

    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }

    const clash = await PracticeSession.findOne(query)
      .populate('sport', 'name')
      .populate('coach', 'name');

    if (clash) {
      return {
        hasClash: true,
        clashingSession: clash,
        message: `You are already enrolled in ${clash.sport.name} during this time (${clash.startTime} to ${clash.endTime})`,
      };
    }

    return { hasClash: false };
  } catch (error) {
    console.error('Check student clash error:', error);
    throw error;
  }
};

/**
 * Check if coach has time clash
 * Prevents coaches from being double-booked
 */
const checkCoachClash = async (coachId, startTime, endTime, excludeSessionId = null) => {
  try {
    const query = {
      coach: coachId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ],
    };

    if (excludeSessionId) {
      query._id = { $ne: excludeSessionId };
    }

    const clash = await PracticeSession.findOne(query)
      .populate('sport', 'name')
      .populate('location', 'name');

    if (clash) {
      return {
        hasClash: true,
        clashingSession: clash,
        message: `Coach is already scheduled for ${clash.sport.name} during this time`,
      };
    }

    return { hasClash: false };
  } catch (error) {
    console.error('Check coach clash error:', error);
    throw error;
  }
};

/**
 * Validate session timing
 */
const validateSessionTiming = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  // Check if start time is in the past
  if (start < now) {
    return {
      isValid: false,
      message: 'Start time cannot be in the past',
    };
  }

  // Check if end time is after start time
  if (end <= start) {
    return {
      isValid: false,
      message: 'End time must be after start time',
    };
  }

  // Check session duration (e.g., minimum 30 minutes, maximum 4 hours)
  const durationHours = (end - start) / (1000 * 60 * 60);
  if (durationHours < 0.5) {
    return {
      isValid: false,
      message: 'Session must be at least 30 minutes long',
    };
  }
  if (durationHours > 4) {
    return {
      isValid: false,
      message: 'Session cannot exceed 4 hours',
    };
  }

  return { isValid: true };
};

module.exports = {
  checkLocationClash,
  checkStudentClash,
  checkCoachClash,
  validateSessionTiming,
};
