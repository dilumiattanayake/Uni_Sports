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

/**
 * Check location booking clash with booking requests and practice sessions
 * Detects conflicts across all location uses
 */
const checkLocationBookingClash = async (locationId, date, startTime, endTime, excludeBookingId = null) => {
  try {
    const LocationBookingRequest = require('../models/LocationBookingRequest');
    
    // Convert date and times to comparable format
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const bookingDayEnd = new Date(bookingDate);
    bookingDayEnd.setHours(23, 59, 59, 999);
    
    // Parse time strings (format: "14:00")
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    // Check for clashes in booking requests (approved or pending)
    const bookingQuery = {
      location: locationId,
      status: { $in: ['approved', 'pending'] },
      date: { $gte: bookingDate, $lte: bookingDayEnd },
    };

    // Time overlap logic for string times
    const bookingClashes = await LocationBookingRequest.find(bookingQuery)
      .populate('coach', 'name')
      .populate('sport', 'name');

    for (const booking of bookingClashes) {
      if (excludeBookingId && booking._id.toString() === excludeBookingId.toString()) {
        continue;
      }

      const [bStartHour, bStartMin] = booking.startTime.split(':').map(Number);
      const [bEndHour, bEndMin] = booking.endTime.split(':').map(Number);
      
      const bStartMins = bStartHour * 60 + bStartMin;
      const bEndMins = bEndHour * 60 + bEndMin;
      const newStartMins = startHour * 60 + startMin;
      const newEndMins = endHour * 60 + endMin;

      // Check for overlap
      if (!(newEndMins <= bStartMins || newStartMins >= bEndMins)) {
        return {
          hasClash: true,
          clashType: 'booking_request',
          clashingBooking: booking,
          message: `Location already requested by ${booking.coach.name} for ${booking.sport.name} from ${booking.startTime} to ${booking.endTime}`,
        };
      }
    }

    // Also check practice sessions by converting booking date + HH:mm to Date values.
    // PracticeSession.startTime/endTime are Date fields, not plain time strings.
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const sessionClash = await checkLocationClash(
      locationId,
      startDateTime,
      endDateTime,
      excludeBookingId
    );
    if (sessionClash.hasClash) {
      return {
        hasClash: true,
        clashType: 'practice_session',
        clashingSession: sessionClash.clashingSession,
        message: sessionClash.message,
      };
    }

    return { hasClash: false };
  } catch (error) {
    console.error('Check location booking clash error:', error);
    throw error;
  }
};

module.exports = {
  checkLocationClash,
  checkStudentClash,
  checkCoachClash,
  validateSessionTiming,
  checkLocationBookingClash,
};
