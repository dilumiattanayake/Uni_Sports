const Inventory = require('../models/Inventory');
const { processRestockAlertsForInventoryIds } = require('../services/inventoryAlertService');

// @desc    Get all inventory items (Students, Coaches, Admins)
// @route   GET /api/inventory
// @access  Private (All authenticated users)
exports.getAllInventory = async (req, res, next) => {
  try {
    // Enable filtering by sport, location, or status (e.g., ?sport=123&status=Available)
    const reqQuery = { ...req.query };
    
    const inventoryDocs = await Inventory.find(reqQuery)
      .populate({
        path: 'sport',
        select: 'name' 
      })
      .populate({
        path: 'location',
        select: 'name facilities' 
      });

    const inventory = inventoryDocs.map((doc) => {
      const item = doc.toObject();
      const waitlist = item.waitlist || [];

      item.waitlistCount = waitlist.length;
      item.isWaitlistedByMe = req.user?.role === 'student'
        ? waitlist.some((entry) => entry.student.toString() === req.user.id)
        : false;

      delete item.waitlist;
      return item;
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private (All authenticated users)
exports.getInventoryById = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('sport', 'name')
      .populate('location', 'name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new equipment to inventory
// @route   POST /api/inventory
// @access  Private (Admin Only)
exports.createInventory = async (req, res, next) => {
  try {
    req.body.lastUpdatedBy = req.user.id;

    // FIX: Catch the file uploaded by Multer
    if (req.file) {
      // Create the path that your React frontend is expecting
      req.body.image = `/uploads/${req.file.filename}`;
    }

    const item = await Inventory.create(req.body);

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Update equipment (Add stock or edit details)
// @route   PUT /api/inventory/:id
// @access  Private (Admin Only)
exports.updateInventory = async (req, res, next) => {
  try {
    let item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    const previousAvailable = item.availableQuantity;

    if (req.body.totalQuantity && req.body.totalQuantity > item.totalQuantity) {
      const addedAmount = req.body.totalQuantity - item.totalQuantity;
      item.availableQuantity += addedAmount;
      item.totalQuantity = req.body.totalQuantity;
    } else if (req.body.totalQuantity && req.body.totalQuantity < item.totalQuantity) {
        return res.status(400).json({ 
            success: false, 
            message: 'Cannot decrease total quantity here. Use the damage/loss endpoint.' 
        });
    }

    if (req.body.itemName) item.itemName = req.body.itemName;
    if (req.body.location) item.location = req.body.location;
    if (req.body.sport) item.sport = req.body.sport;
    
    // FIX: Update image if a new file was uploaded
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }
    
    item.lastUpdatedBy = req.user.id;

    await item.save();

    if (previousAvailable <= 0 && item.availableQuantity > 0) {
      await processRestockAlertsForInventoryIds([item._id]);
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete equipment record entirely
// @route   DELETE /api/inventory/:id
// @access  Private (Admin Only)
exports.deleteInventory = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join waitlist for an out-of-stock item
// @route   POST /api/inventory/:id/waitlist
// @access  Private (Student)
exports.joinInventoryWaitlist = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (item.availableQuantity > 0) {
      return res.status(400).json({
        success: false,
        message: `${item.itemName} is currently available. You can request it now.`,
      });
    }

    const alreadyWaitlisted = item.waitlist.some(
      (entry) => entry.student.toString() === req.user.id
    );

    if (!alreadyWaitlisted) {
      item.waitlist.push({ student: req.user.id });
      await item.save();
    }

    return res.status(200).json({
      success: true,
      message: alreadyWaitlisted
        ? 'You are already on the waitlist for this item.'
        : 'You have been added to the waitlist. We will notify you once it is available.',
      data: {
        itemId: item._id,
        waitlistCount: item.waitlist.length,
        isWaitlistedByMe: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave waitlist for an item
// @route   DELETE /api/inventory/:id/waitlist
// @access  Private (Student)
exports.leaveInventoryWaitlist = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    const previousCount = item.waitlist.length;
    item.waitlist = item.waitlist.filter(
      (entry) => entry.student.toString() !== req.user.id
    );

    if (item.waitlist.length !== previousCount) {
      await item.save();
    }

    return res.status(200).json({
      success: true,
      message: 'You have been removed from the waitlist.',
      data: {
        itemId: item._id,
        waitlistCount: item.waitlist.length,
        isWaitlistedByMe: false,
      },
    });
  } catch (error) {
    next(error);
  }
};