const Merchandise = require('../models/Merchandise');
const MerchandiseOrder = require('../models/MerchandiseOrder');

// ==========================================
// ADMIN / COACH CONTROLLERS
// ==========================================

// @desc    Add new merchandise to the shop/inventory
// @route   POST /api/merchandise
// @access  Private (Admin)
exports.createMerchandise = async (req, res, next) => {
  try {
    req.body.lastUpdatedBy = req.user.id;
    
    // Parse the variants string back into a JSON array for Mongoose
    if (typeof req.body.variants === 'string') {
      req.body.variants = JSON.parse(req.body.variants);
    }

    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }

    const merch = await Merchandise.create(req.body);
    res.status(201).json({ success: true, data: merch });
  } catch (error) {
    next(error);
  }
};

// @desc    Update merchandise (Edit details, price, stock, or image)
// @route   PUT /api/merchandise/:id
// @access  Private (Admin)
exports.updateMerchandise = async (req, res, next) => {
  try {
    let merch = await Merchandise.findById(req.params.id);

    if (!merch) {
      return res.status(404).json({ success: false, message: 'Merchandise not found' });
    }

    // Parse variants if provided
    if (req.body.variants) {
      if (typeof req.body.variants === 'string') {
        req.body.variants = JSON.parse(req.body.variants);
      }
      merch.variants = req.body.variants;
    }

    // Update other allowed fields
    if (req.body.itemName) merch.itemName = req.body.itemName;
    if (req.body.sport) merch.sport = req.body.sport;
    if (req.body.category) merch.category = req.body.category;
    if (req.body.price !== undefined) merch.price = req.body.price;
    
    // Catch the new image from Multer if uploaded
    if (req.file) {
      merch.image = `/uploads/${req.file.filename}`;
    }
    
    merch.lastUpdatedBy = req.user.id;

    await merch.save();

    res.status(200).json({ success: true, data: merch });
  } catch (error) {
    next(error);
  }
};
// @desc    Update order status (e.g., mark as Paid or Handed Over)
// @route   PUT /api/merchandise/orders/:id/status
// @access  Private (Admin, Coach)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { paymentStatus, fulfillmentStatus } = req.body;
    const order = await MerchandiseOrder.findById(req.params.id);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
    
    order.processedBy = req.user.id;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// STUDENT CONTROLLERS
// ==========================================

// @desc    Get all available merchandise
// @route   GET /api/merchandise
// @access  Private (All)
exports.getAllMerchandise = async (req, res, next) => {
  try {
    // Removed the old stock filter so Admins can see ALL items, including out-of-stock ones.
    const merch = await Merchandise.find({}).populate('sport', 'name');
    
    res.status(200).json({ success: true, count: merch.length, data: merch });
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase or Claim a merchandise item
// @route   POST /api/merchandise/:id/order
// @access  Private (Student)
exports.createOrder = async (req, res, next) => {
  try {
    const { quantity, selectedSize } = req.body; // NEW: Get selectedSize
    const requestedQty = Number(quantity) || 1;

    const merch = await Merchandise.findById(req.params.id);

    if (!merch) {
      return res.status(404).json({ success: false, message: 'Merchandise not found' });
    }

    // NEW: Find the specific size variant
    const variantIndex = merch.variants.findIndex(v => v.size === selectedSize);
    
    if (variantIndex === -1) {
      return res.status(400).json({ success: false, message: `Size ${selectedSize} is not available for this item.` });
    }

    if (merch.variants[variantIndex].stockQuantity < requestedQty) {
      return res.status(400).json({ success: false, message: 'Not enough stock available for this size' });
    }

    const totalPrice = merch.price * requestedQty;
    const paymentStatus = totalPrice === 0 ? 'Free Issue' : 'Pending';

    const order = await MerchandiseOrder.create({
      student: req.user.id,
      merchandise: merch._id,
      selectedSize, // Save the size!
      quantity: requestedQty,
      totalPrice,
      paymentStatus
    });

    // Deduct stock from that specific variant
    merch.variants[variantIndex].stockQuantity -= requestedQty;
    merch.soldOrIssuedQuantity += requestedQty;
    await merch.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete merchandise entirely
// @route   DELETE /api/merchandise/:id
// @access  Private (Admin)
exports.deleteMerchandise = async (req, res, next) => {
  try {
    const merch = await Merchandise.findById(req.params.id);

    if (!merch) {
      return res.status(404).json({ success: false, message: 'Merchandise not found' });
    }

    await merch.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};