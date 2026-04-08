const mongoose = require('mongoose');

const MerchandiseOrderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  merchandise: {
    type: mongoose.Schema.ObjectId,
    ref: 'Merchandise',
    required: true
  },
  selectedSize: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Free Issue'],
    default: 'Pending'
  },
  fulfillmentStatus: {
    type: String,
    enum: ['Processing', 'Ready for Pickup', 'Delivered/Handed Over'],
    default: 'Processing'
  },
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MerchandiseOrder', MerchandiseOrderSchema);