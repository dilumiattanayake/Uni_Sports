const LocationBookingRequest = require('../models/LocationBookingRequest');
const Location = require('../models/Location');
const User = require('../models/User');
const Sport = require('../models/Sport');
const Notification = require('../models/Notification');
const { ErrorResponse } = require('../middleware/errorHandler');
const { checkLocationBookingClash } = require('../services/clashDetectionService');
const mongoose = require('mongoose');

const resolveByIdOrName = async (Model, value) => {
  if (!value) return null;

  if (mongoose.Types.ObjectId.isValid(value)) {
    const byId = await Model.findById(value);
    if (byId) return byId;
  }

  return Model.findOne({ name: value });
};

/**
 * @desc    Create location booking request
 * @route   POST /api/location-bookings
 * @access  Private/Coach
 */
const createLocationBookingRequest = async (req, res, next) => {
  try {
    const {
      sport,
      location,
      date,
      startTime,
      endTime,
      participantCount,
      purpose,
      equipmentNeeded,
      specialRequirements,
    } = req.body;

    // Validate location exists (supports ObjectId or name)
    const locationExists = await resolveByIdOrName(Location, location);
    if (!locationExists) {
      return next(new ErrorResponse('Location not found', 404));
    }

    // Validate sport exists (supports ObjectId or name)
    const sportExists = await resolveByIdOrName(Sport, sport);
    if (!sportExists) {
      return next(new ErrorResponse('Sport not found', 404));
    }

    // Check if coach is assigned to this sport
    const isAssignedCoach = sportExists.coaches.some(
      (coachId) => coachId.toString() === req.user._id.toString()
    );
    if (!isAssignedCoach) {
      return next(
        new ErrorResponse('You are not assigned as coach to this sport', 403)
      );
    }

    // Validate date is in future
    const bookingDate = new Date(date);
    const now = new Date();
    if (bookingDate < now) {
      return next(new ErrorResponse('Booking date must be in the future', 400));
    }

    const bookingDayStart = new Date(bookingDate);
    bookingDayStart.setHours(0, 0, 0, 0);
    const bookingDayEnd = new Date(bookingDate);
    bookingDayEnd.setHours(23, 59, 59, 999);

    const exactSlotExists = await LocationBookingRequest.findOne({
      location: locationExists._id,
      date: { $gte: bookingDayStart, $lte: bookingDayEnd },
      startTime,
      endTime,
      status: { $in: ['pending', 'approved'] },
    });

    if (exactSlotExists) {
      return next(
        new ErrorResponse(
          'This location is already booked for the selected date and time',
          409
        )
      );
    }

    // Check for location booking clashes
    const clashCheck = await checkLocationBookingClash(
      locationExists._id,
      date,
      startTime,
      endTime
    );

    if (clashCheck.hasClash) {
      return next(
        new ErrorResponse(
          clashCheck.message || 'Location is already booked for the selected date and time',
          409
        )
      );
    }
    
    let bookingData = {
      coach: req.user._id,
      sport: sportExists._id,
      location: locationExists._id,
      date,
      startTime,
      endTime,
      participantCount,
      purpose,
      equipmentNeeded: equipmentNeeded || [],
      specialRequirements,
      hasClash: false,
    };

    const bookingRequest = await LocationBookingRequest.create(bookingData);

    // Populate the request
    const populatedRequest = await LocationBookingRequest.findById(bookingRequest._id)
      .populate('coach', 'name email')
      .populate('sport', 'name')
      .populate('location', 'name');

    // Notify admin about new request
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'admin_location_booking_request',
        title: 'New Location Booking Request',
        message: `${req.user.name} has requested ${populatedRequest.location.name} on ${new Date(date).toLocaleDateString()}`,
        relatedLocationBookingRequest: bookingRequest._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Location booking request created successfully',
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all location booking requests for logged-in coach
 * @route   GET /api/location-bookings/coach/my-requests
 * @access  Private/Coach
 */
const getMyLocationBookingRequests = async (req, res, next) => {
  try {
    const { status, date, sport } = req.query;

    const query = { coach: req.user._id };

    if (status) {
      query.status = status;
    }

    if (sport) {
      query.sport = sport;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const requests = await LocationBookingRequest.find(query)
      .populate('location', 'name type address')
      .populate('sport', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all location booking requests (Admin)
 * @route   GET /api/location-bookings
 * @access  Private/Admin
 */
const getAllLocationBookingRequests = async (req, res, next) => {
  try {
    const { status, location, sport, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (location) {
      query.location = location;
    }

    if (sport) {
      query.sport = sport;
    }

    const requests = await LocationBookingRequest.find(query)
      .populate('coach', 'name email')
      .populate('location', 'name type address')
      .populate('sport', 'name')
      .populate('processedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await LocationBookingRequest.countDocuments(query);

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
 * @desc    Get single location booking request
 * @route   GET /api/location-bookings/:id
 * @access  Private
 */
const getLocationBookingRequest = async (req, res, next) => {
  try {
    const request = await LocationBookingRequest.findById(req.params.id)
      .populate('coach', 'name email phone')
      .populate('location', 'name type address facilities')
      .populate('sport', 'name description')
      .populate('processedBy', 'name');

    if (!request) {
      return next(new ErrorResponse('Location booking request not found', 404));
    }

    // Check authorization
    if (req.user.role !== 'admin' && request.coach.toString() !== req.user._id.toString()) {
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
 * @desc    Update location booking request
 * @route   PUT /api/location-bookings/:id
 * @access  Private/Coach (only if pending/declined)
 */
const updateLocationBookingRequest = async (req, res, next) => {
  try {
    let request = await LocationBookingRequest.findById(req.params.id);

    if (!request) {
      return next(new ErrorResponse('Location booking request not found', 404));
    }

    // Check authorization
    if (request.coach.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to update this request', 403));
    }

    // Can only update if pending or declined
    if (!['pending', 'declined'].includes(request.status)) {
      return next(
        new ErrorResponse(
          `Cannot update request with status: ${request.status}`,
          400
        )
      );
    }

    const {
      date,
      startTime,
      endTime,
      participantCount,
      purpose,
      equipmentNeeded,
      specialRequirements,
    } = req.body;

    // If date/time changed, check for new clashes
    if (date || startTime || endTime) {
      const newDate = date || request.date;
      const newStartTime = startTime || request.startTime;
      const newEndTime = endTime || request.endTime;

      const clashCheck = await checkLocationBookingClash(
        request.location,
        newDate,
        newStartTime,
        newEndTime,
        request._id
      );

      request.hasClash = clashCheck.hasClash;
      if (clashCheck.hasClash) {
        request.clashDetails = {
          clashingSport: clashCheck.clashingBooking?.sport?.name || clashCheck.clashingSession?.sport?.name,
          clashingCoach: clashCheck.clashingBooking?.coach?.name || clashCheck.clashingSession?.coach?.name,
          clashTime: `${clashCheck.clashingBooking?.startTime || clashCheck.clashingSession?.startTime} to ${clashCheck.clashingBooking?.endTime || clashCheck.clashingSession?.endTime}`,
        };
      }
    }

    // Update fields
    if (date) request.date = date;
    if (startTime) request.startTime = startTime;
    if (endTime) request.endTime = endTime;
    if (participantCount) request.participantCount = participantCount;
    if (purpose) request.purpose = purpose;
    if (equipmentNeeded) request.equipmentNeeded = equipmentNeeded;
    if (specialRequirements) request.specialRequirements = specialRequirements;

    // Reset to pending if previously declined
    if (request.status === 'declined') {
      request.status = 'pending';
      request.processedBy = null;
      request.processedAt = null;
      request.adminNotes = null;
    }

    await request.save();

    const updatedRequest = await LocationBookingRequest.findById(request._id)
      .populate('coach', 'name email')
      .populate('sport', 'name')
      .populate('location', 'name');

    res.status(200).json({
      success: true,
      message: 'Location booking request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve location booking request
 * @route   PUT /api/location-bookings/:id/approve
 * @access  Private/Admin
 */
const approveLocationBookingRequest = async (req, res, next) => {
  try {
    const request = await LocationBookingRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        processedBy: req.user._id,
        processedAt: new Date(),
      },
      { new: true }
    )
      .populate('coach', 'name email')
      .populate('sport', 'name')
      .populate('location', 'name');

    if (!request) {
      return next(new ErrorResponse('Location booking request not found', 404));
    }

    // Send notification to coach
    await Notification.create({
      recipient: request.coach._id,
      type: 'location_booking_approved',
      title: 'Location Booking Approved',
      message: `Your booking request for ${request.location.name} on ${new Date(request.date).toLocaleDateString()} has been approved!`,
      relatedLocationBookingRequest: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'Location booking request approved successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline location booking request
 * @route   PUT /api/location-bookings/:id/decline
 * @access  Private/Admin
 */
const declineLocationBookingRequest = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const request = await LocationBookingRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'declined',
        processedBy: req.user._id,
        processedAt: new Date(),
        adminNotes,
      },
      { new: true }
    )
      .populate('coach', 'name email')
      .populate('sport', 'name')
      .populate('location', 'name');

    if (!request) {
      return next(new ErrorResponse('Location booking request not found', 404));
    }

    // Send notification to coach
    await Notification.create({
      recipient: request.coach._id,
      type: 'location_booking_declined',
      title: 'Location Booking Declined',
      message: `Your booking request for ${request.location.name} has been declined. ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
      relatedLocationBookingRequest: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'Location booking request declined successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel location booking request
 * @route   DELETE /api/location-bookings/:id
 * @access  Private/Coach (if pending)
 */
const cancelLocationBookingRequest = async (req, res, next) => {
  try {
    let request = await LocationBookingRequest.findById(req.params.id);

    if (!request) {
      return next(new ErrorResponse('Location booking request not found', 404));
    }

    // Check authorization
    if (request.coach.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to cancel this request', 403));
    }

    // Can only cancel if pending or declined
    if (!['pending', 'declined'].includes(request.status)) {
      return next(
        new ErrorResponse(
          `Cannot cancel request with status: ${request.status}`,
          400
        )
      );
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Location booking request cancelled successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocationBookingRequest,
  getMyLocationBookingRequests,
  getAllLocationBookingRequests,
  getLocationBookingRequest,
  updateLocationBookingRequest,
  approveLocationBookingRequest,
  declineLocationBookingRequest,
  cancelLocationBookingRequest,
};
