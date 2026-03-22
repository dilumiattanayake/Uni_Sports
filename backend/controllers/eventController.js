const Event = require('../models/Event');
const { ErrorResponse } = require('../middleware/errorHandler');

const getEvents = async (req, res, next) => {
  try {
    const { sport, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (sport) query.sport = sport;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('sport', 'name category icon')
      .populate('createdBy', 'name email')
      .populate('confirmedCount') // Crucial for accurate capacities
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true, count: events.length, total, page: Number(page), pages: Math.ceil(total / limit), data: events,
    });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('sport', 'name category icon')
      .populate('createdBy', 'name email')
      .populate('confirmedCount');

    if (!event) return next(new ErrorResponse('Event not found', 404));

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    if (req.file) req.body.imageUrl = `/uploads/${req.file.filename}`;
    req.body.createdBy = req.user.id || req.user._id;

    const event = await Event.create(req.body);
    const populatedEvent = await Event.findById(event._id)
      .populate('sport', 'name category icon')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Event created successfully', data: populatedEvent });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new ErrorResponse('Event not found', 404));

    if (event.status === 'completed' || event.status === 'cancelled') {
      return next(new ErrorResponse(`Cannot update a ${event.status} event`, 400));
    }

    if (req.file) req.body.imageUrl = `/uploads/${req.file.filename}`;

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('sport', 'name category icon')
      .populate('createdBy', 'name email')
      .populate('confirmedCount');

    res.status(200).json({ success: true, message: 'Event updated successfully', data: updatedEvent });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new ErrorResponse('Event not found', 404));
    if (event.status === 'ongoing') return next(new ErrorResponse('Cannot delete an ongoing event', 400));

    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };