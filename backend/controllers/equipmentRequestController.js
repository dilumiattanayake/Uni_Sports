const EquipmentRequest = require('../models/EquipmentRequest');
const Inventory = require('../models/Inventory');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { processRestockAlertsForInventoryIds } = require('../services/inventoryAlertService');

const generatePickupQrPass = async (request) => {
  if (request.qrPass?.token && request.qrPass?.qrImage) {
    return request.qrPass;
  }

  const token = crypto.randomBytes(24).toString('hex');
  const qrPayload = JSON.stringify({
    type: 'equipment_pickup',
    requestId: request._id,
    token,
    studentId: request.student,
  });

  const qrImage = await QRCode.toDataURL(qrPayload, {
    width: 280,
    margin: 1,
  });

  request.qrPass = {
    token,
    qrImage,
    generatedAt: new Date(),
    scannedAt: null,
  };

  return request.qrPass;
};

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
      .select('+qrPass')
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
      .select('+qrPass')
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

    let finalStatus = status;

    // LOGIC: If approving or marking as borrowed from pending, deduct inventory
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

    // LOGIC: If returning items, add back available stock and update damage/loss ledgers.
    if ((status === 'Returned' || status === 'Returned with Issues') &&
        ['Borrowed', 'Approved', 'Issue Reported', 'Overdue'].includes(request.status)) {

      let hasDamageOrLoss = false;
      const restockedInventoryIds = [];

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
        restockedInventoryIds.push(invItem._id);
      }

      // Force status to "Returned with Issues" if damages were logged, regardless of what admin sent
      finalStatus = hasDamageOrLoss ? 'Returned with Issues' : 'Returned';
      request.actualReturnDate = Date.now();

      await processRestockAlertsForInventoryIds(restockedInventoryIds);
    }

    if (status === 'Approved') {
      await generatePickupQrPass(request);
    }

    // Update the request document
    request.status = finalStatus;
    request.processedBy = req.user.id;
    if (notes) request.notes = notes;

    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Process student pickup from QR pass scan
// @route   POST /api/equipment-requests/scan-qr
// @access  Private (Admin)
exports.processQrPickup = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData || typeof qrData !== 'string') {
      return res.status(400).json({ success: false, message: 'QR data is required' });
    }

    let requestId;
    let token;

    try {
      const parsed = JSON.parse(qrData);
      requestId = parsed.requestId;
      token = parsed.token;
    } catch (error) {
      token = qrData;
    }

    if (!token) {
      return res.status(400).json({ success: false, message: 'Invalid QR payload' });
    }

    const query = requestId
      ? { _id: requestId, 'qrPass.token': token }
      : { 'qrPass.token': token };

    const request = await EquipmentRequest.findOne(query)
      .populate('student', 'name email')
      .populate('items.equipment', 'itemName location');

    if (!request) {
      return res.status(404).json({ success: false, message: 'No matching request found for this QR code.' });
    }

    if (request.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `This request cannot be checked out because its current status is ${request.status}.`,
        data: request,
      });
    }

    request.status = 'Borrowed';
    request.processedBy = req.user.id;
    request.qrPass.scannedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'QR scanned successfully. Request marked as Borrowed.',
      data: request,
    });
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