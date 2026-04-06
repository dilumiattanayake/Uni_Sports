const Inventory = require('../models/Inventory');

// @desc    Get all inventory items (Students, Coaches, Admins)
// @route   GET /api/inventory
// @access  Private (All authenticated users)
exports.getAllInventory = async (req, res, next) => {
  try {
    // Enable filtering by sport, location, or status (e.g., ?sport=123&status=Available)
    const reqQuery = { ...req.query };
    
    const inventory = await Inventory.find(reqQuery)
      .populate({
        path: 'sport',
        select: 'name' 
      })
      .populate({
        path: 'location',
        select: 'name facilities' 
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