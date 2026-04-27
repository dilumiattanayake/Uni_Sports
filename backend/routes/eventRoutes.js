const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Middleware
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator'); 
const upload = require('../middleware/upload'); 

// Zod Schemas
const { createEventSchema, updateEventSchema } = require('../validators/eventValidator');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  validate(createEventSchema),
  eventController.createEvent
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  validate(updateEventSchema),
  eventController.updateEvent
);

router.delete('/:id', protect, authorize('admin'), eventController.deleteEvent);

module.exports = router;