const express = require('express');
const router = express.Router();

// Import Controllers
const { 
  createMerchandise, 
  updateMerchandise, 
  getAllMerchandise, 
  deleteMerchandise,
  createOrder, 
  updateOrderStatus 
} = require('../controllers/merchandiseController');

// Import Middleware
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator'); // Your validator middleware

// Import Zod Schemas
const {
  createMerchandiseSchema,
  updateMerchandiseSchema,
  createOrderSchema,
  updateOrderStatusSchema
} = require('../validators/merchandiseValidator');

// Merchandise CRUD
router.route('/')
  .get(protect, getAllMerchandise) 
  .post(
    protect, 
    authorize('admin'), 
    upload.single('image'), 
    validate(createMerchandiseSchema), // MUST be after upload.single
    createMerchandise
  ); 

router.route('/:id')
  .put(
    protect, 
    authorize('admin'), 
    upload.single('image'), 
    validate(updateMerchandiseSchema), // MUST be after upload.single
    updateMerchandise
  )
  .delete(protect, authorize('admin'), deleteMerchandise
  );

// student Orders
router.route('/:id/order')
  .post(
    protect, 
    authorize('student'), 
    validate(createOrderSchema), // Validation added
    createOrder
  );

// admin/coach processing orders
router.route('/orders/:id/status')
  .put(
    protect, 
    authorize('admin', 'coach'), 
    validate(updateOrderStatusSchema), // Validation added
    updateOrderStatus
  );

module.exports = router;