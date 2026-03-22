const express = require('express');
const router = express.Router();

// Import Controllers
const { 
  createBorrowRequest, 
  getMyRequests, 
  getAllRequests, 
  updateRequestStatus, 
  reportIssueOnRequest 
} = require('../controllers/equipmentRequestController');

// Import Middleware
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validator'); // Your validator middleware

// Import Zod Schemas
const {
  createBorrowRequestSchema,
  updateRequestStatusSchema,
  reportIssueOnRequestSchema
} = require('../validators/equipmentRequestValidator');

// Note: Order matters here. Put specific routes (like /my-requests) BEFORE dynamic ones (like /:id)

router.route('/my-requests')
  .get(protect, authorize('Student'), getMyRequests);

router.route('/')
  .get(protect, authorize('Admin', 'Coach'), getAllRequests) 
  .post(
    protect, 
    authorize('Student'), 
    validate(createBorrowRequestSchema), // Validation added
    createBorrowRequest
  ); 

router.route('/:id/status')
  .put(
    protect, 
    authorize('Admin', 'Coach'), 
    validate(updateRequestStatusSchema), // Validation added
    updateRequestStatus
  );

router.route('/:id/report-issue')
  .put(
    protect, 
    authorize('Student'), 
    validate(reportIssueOnRequestSchema), // Validation added
    reportIssueOnRequest
  );

module.exports = router;