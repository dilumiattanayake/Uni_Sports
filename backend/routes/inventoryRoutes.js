const express = require('express');
const router = express.Router();

// Import Controllers
const { 
  getAllInventory, 
  getInventoryById, 
  createInventory, 
  updateInventory, 
  deleteInventory, 
  joinInventoryWaitlist,
  leaveInventoryWaitlist,
} = require('../controllers/inventoryController');

// Import Middleware
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator'); // Your validator middleware

// Import Zod Schemas
const {
  createInventorySchema,
  updateInventorySchema,
  reportIssueSchema
} = require('../validators/inventoryValidator');

// Set up routes
router.route('/')
  .get(protect, getAllInventory) 
  .post(
    protect, 
    authorize('admin'), 
    upload.single('image'), 
    validate(createInventorySchema), // MUST be after upload.single
    createInventory
  ); 

router.route('/:id')
  .get(protect, getInventoryById)
  .put(
    protect, 
    authorize('admin'), 
    upload.single('image'), 
    validate(updateInventorySchema), // MUST be after upload.single
    updateInventory
  )
  .delete(protect, authorize('admin'), deleteInventory);

router.route('/:id/waitlist')
  .post(protect, authorize('student'), joinInventoryWaitlist)
  .delete(protect, authorize('student'), leaveInventoryWaitlist);

module.exports = router;