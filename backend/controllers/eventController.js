
const Event = require('../models/Event');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get all events
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const { sport, status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};
    if (sport) {
      query.sport = sport;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query
    const events = await Event.find(query)
      .populate('sport', 'name category imageUrl')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('sport', 'name category imageUrl equipmentNeeded')
      .populate('createdBy', 'name email')
      .populate('registrations.student', 'name email studentId');

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create event
 * @route   POST /api/events
 * @access  Private/Admin
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      sport,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      maxParticipants,
      registrationFormUrl,
      imageUrl,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      sport,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      maxParticipants,
      registrationFormUrl,
      imageUrl,
      createdBy: req.user._id,
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('sport', 'name category imageUrl')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private/Admin
 */
const updateEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      sport,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      maxParticipants,
      registrationFormUrl,
      imageUrl,
      status,
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Prevent editing a completed or cancelled event
    if (event.status === 'completed' || event.status === 'cancelled') {
      return next(
        new ErrorResponse(`Cannot update a ${event.status} event`, 400)
      );
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        sport,
        startDate,
        endDate,
        registrationDeadline,
        venue,
        maxParticipants,
        registrationFormUrl,
        imageUrl,
        status,
      },
      { new: true, runValidators: true }
    )
      .populate('sport', 'name category imageUrl')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private/Admin
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Prevent deleting an ongoing event
    if (event.status === 'ongoing') {
      return next(new ErrorResponse('Cannot delete an ongoing event', 400));
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register student for an event
 * @route   POST /api/events/:id/register
 * @access  Private/Student
 */
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Check if registration is open
    if (!event.isRegistrationOpen) {
      return next(
        new ErrorResponse(
          'Registration is closed for this event',
          400
        )
      );
    }

    // Check if student already registered
    const alreadyRegistered = event.registrations.some(
      (r) => r.student.toString() === req.user._id.toString()
    );
    if (alreadyRegistered) {
      return next(
        new ErrorResponse('You are already registered for this event', 400)
      );
    }

    // Determine registration status: confirmed or waitlisted
    const confirmedCount = event.registrations.filter(
      (r) => r.status === 'confirmed'
    ).length;
    const registrationStatus =
      confirmedCount < event.maxParticipants ? 'confirmed' : 'waitlisted';

    event.registrations.push({
      student: req.user._id,
      status: registrationStatus,
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: `Successfully registered. Status: ${registrationStatus}`,
      data: {
        status: registrationStatus,
        registrationFormUrl: event.registrationFormUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unregister student from an event
 * @route   DELETE /api/events/:id/register
 * @access  Private/Student
 */
const unregisterFromEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Check if student is registered
    const registrationIndex = event.registrations.findIndex(
      (r) => r.student.toString() === req.user._id.toString()
    );
    if (registrationIndex === -1) {
      return next(
        new ErrorResponse('You are not registered for this event', 400)
      );
    }

    // Prevent unregistering after event has started
    if (event.status === 'ongoing' || event.status === 'completed') {
      return next(
        new ErrorResponse(
          `Cannot unregister from a ${event.status} event`,
          400
        )
      );
    }

    event.registrations.splice(registrationIndex, 1);

    // Promote first waitlisted student to confirmed if a spot opens up
    const waitlisted = event.registrations.find(
      (r) => r.status === 'waitlisted'
    );
    if (waitlisted) {
      waitlisted.status = 'confirmed';
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from the event',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student's registration status (Admin only)
 * @route   PUT /api/events/:id/registrations/:registrationId
 * @access  Private/Admin
 */
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    const registration = event.registrations.id(req.params.registrationId);
    if (!registration) {
      return next(new ErrorResponse('Registration not found', 404));
    }

    registration.status = status;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Registration status updated successfully',
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all registrations for an event (Admin only)
 * @route   GET /api/events/:id/registrations
 * @access  Private/Admin
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.student', 'name email studentId phone');

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    res.status(200).json({
      success: true,
      count: event.registrations.length,
      data: event.registrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get events registered by the logged-in student
 * @route   GET /api/events/my-events
 * @access  Private/Student
 */
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      'registrations.student': req.user._id,
    })
      .populate('sport', 'name category imageUrl')
      .sort({ startDate: 1 });

    // Attach only the current user's registration entry to each event
    const data = events.map((event) => {
      const myRegistration = event.registrations.find(
        (r) => r.student.toString() === req.user._id.toString()
      );
      return {
        ...event.toJSON(),
        myRegistration,
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  updateRegistrationStatus,
  getEventRegistrations,
  getMyEvents,
};