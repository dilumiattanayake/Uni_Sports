const EquipmentRequest = require('../models/EquipmentRequest');
const Inventory = require('../models/Inventory');

// ==========================================
// STUDENT CONTROLLERS
// ==========================================

// @desc    Submit a request to borrow equipment
// @route   POST /api/equipment-requests
// @access  Private (Student)
exports.createBorrowRequest = async (req, res, next) => {
  try {
    const { items, expectedReturnDate, notes } = req.body;

    // 1. Verify availability BEFORE creating the request
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.equipment);
      
      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: `Equipment ID ${item.equipment} not found` });
      }

      if (inventoryItem.availableQuantity < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Not enough ${inventoryItem.itemName} available. You requested ${item.quantity}, but only ${inventoryItem.availableQuantity} are left.` 
        });
      }
    }

    // 2. Create the request (Status defaults to 'Pending')
    const request = await EquipmentRequest.create({
      student: req.user.id,
      items,
      expectedReturnDate,
      notes
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in student's requests
// @route   GET /api/equipment-requests/my-requests
// @access  Private (Student)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await EquipmentRequest.find({ student: req.user.id })
      .populate('items.equipment', 'itemName sport')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN & COACH CONTROLLERS
// ==========================================

// @desc    Get all requests (filter by status via query params)
// @route   GET /api/equipment-requests
// @access  Private (Admin, Coach)
exports.getAllRequests = async (req, res, next) => {
  try {
    // Example: /api/equipment-requests?status=Pending
    const requests = await EquipmentRequest.find(req.query)
      .populate('student', 'name email')
      .populate('items.equipment', 'itemName location')
      .sort('expectedReturnDate');

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Process a request (Approve, Reject, Mark Borrowed, Mark Returned)
// @route   PUT /api/equipment-requests/:id/status
// @access  Private (Admin, Coach)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const request = await EquipmentRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // LOGIC: If approving or marking as borrowed, we must deduct from inventory
    if ((status === 'Approved' || status === 'Borrowed') && request.status === 'Pending') {
      for (const item of request.items) {
        const invItem = await Inventory.findById(item.equipment);
        
        // Double check availability in case it was given to someone else while this was pending
        if (invItem.availableQuantity < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${invItem.itemName} to approve this request.` });
        }
        
        invItem.availableQuantity -= item.quantity;
        await invItem.save(); // This triggers the pre('save') hook in Inventory to update "Out of Stock" status
      }
    }

    // LOGIC: If marking as returned, we must add back to inventory
    if (status === 'Returned' && (request.status === 'Borrowed' || request.status === 'Approved' || request.status === 'Overdue')) {
      for (const item of request.items) {
        const invItem = await Inventory.findById(item.equipment);
        invItem.availableQuantity += item.quantity;
        await invItem.save();
      }
      request.actualReturnDate = Date.now();
    }

    if ((status === 'Returned' || status === 'Returned with Issues') && 
        ['Borrowed', 'Issue Reported', 'Overdue'].includes(request.status)) {
      
      let hasDamageOrLoss = false;

      for (const item of request.items) {
        const invItem = await Inventory.findById(item.equipment);
        
        // Calculate how many were returned in perfect condition
        const totalIssues = item.damagedQuantity + item.lostQuantity;
        const intactQuantity = item.quantity - totalIssues;

        if (totalIssues > 0) hasDamageOrLoss = true;

        // 1. Add the perfect ones back to Available
        if (intactQuantity > 0) {
          invItem.availableQuantity += intactQuantity;
        }

        // 2. Add the broken/lost ones to the respective ledgers in main Inventory
        if (item.damagedQuantity > 0) {
          invItem.damagedQuantity += item.damagedQuantity;
        }
        if (item.lostQuantity > 0) {
          invItem.lostQuantity += item.lostQuantity;
        }

        await invItem.save();
      }

      // Force status to "Returned with Issues" if damages were logged, regardless of what admin sent
      request.status = hasDamageOrLoss ? 'Returned with Issues' : 'Returned';
      request.actualReturnDate = Date.now();
    }

    // Update the request document
    request.status = status;
    request.processedBy = req.user.id;
    if (notes) request.notes = notes;

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Student reports damage or loss on a borrowed item
// @route   PUT /api/equipment-requests/:id/report-issue
// @access  Private (Student)
exports.reportIssueOnRequest = async (req, res, next) => {
  try {
    const { itemId, damagedQuantity, lostQuantity, issueNote } = req.body;
    
    const request = await EquipmentRequest.findOne({ 
      _id: req.params.id, 
      student: req.user.id // Ensure they only update their own requests
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Borrowed' && request.status !== 'Overdue') {
      return res.status(400).json({ success: false, message: 'You can only report issues for items currently borrowed.' });
    }

    // Find the specific item in the request array
    const itemIndex = request.items.findIndex(i => i._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in this request' });
    }

    const item = request.items[itemIndex];

    // Validate quantities so they don't report more damaged than they borrowed
    const totalIssues = (Number(damagedQuantity) || 0) + (Number(lostQuantity) || 0);
    if (totalIssues > item.quantity) {
      return res.status(400).json({ success: false, message: 'Reported issues exceed the borrowed quantity.' });
    }

    // Update the item record
    request.items[itemIndex].damagedQuantity = Number(damagedQuantity) || 0;
    request.items[itemIndex].lostQuantity = Number(lostQuantity) || 0;
    request.items[itemIndex].issueNote = issueNote;
    
    // Change status to alert the admin
    request.status = 'Issue Reported';

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};