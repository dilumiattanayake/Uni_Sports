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
    // The image URL will be saved here if it's included in req.body
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

    // Update allowed fields
    if (req.body.itemName) merch.itemName = req.body.itemName;
    if (req.body.category) merch.category = req.body.category;
    if (req.body.size) merch.size = req.body.size;
    if (req.body.price !== undefined) merch.price = req.body.price;
    if (req.body.stockQuantity !== undefined) merch.stockQuantity = req.body.stockQuantity;
    if (req.body.image) merch.image = req.body.image; // Update image if provided
    
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
    // Only show items that are actually in stock
    const merch = await Merchandise.find({ stockQuantity: { $gt: 0 } }).populate('sport', 'name');
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
    const { quantity } = req.body;
    const requestedQty = Number(quantity) || 1;

    const merch = await Merchandise.findById(req.params.id);

    if (!merch) {
      return res.status(404).json({ success: false, message: 'Merchandise not found' });
    }

    if (merch.stockQuantity < requestedQty) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    // Calculate price
    const totalPrice = merch.price * requestedQty;
    const paymentStatus = totalPrice === 0 ? 'Free Issue' : 'Pending';

    // Create the order
    const order = await MerchandiseOrder.create({
      student: req.user.id,
      merchandise: merch._id,
      quantity: requestedQty,
      totalPrice,
      paymentStatus
    });

    // Deduct from stock immediately to prevent double-selling
    merch.stockQuantity -= requestedQty;
    merch.soldOrIssuedQuantity += requestedQty;
    await merch.save();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};