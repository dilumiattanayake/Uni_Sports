// models/Merchandise.js
const mongoose = require('mongoose');

const MerchandiseSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please add the merchandise name'],
    trim: true
  },
  sport: {
    type: mongoose.Schema.ObjectId,
    ref: 'Sport',
    required: [true, 'Please assign this merch to a sport']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  category: {
    type: String,
    required: true,
    enum: ['Apparel', 'Team Kit', 'Accessories', 'Footwear', 'Other'] 
  },
  price: {
    type: Number,
    required: true,
    default: 0 
  },
  // NEW: Array of sizes and their specific stock
  variants: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A'],
      required: true
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  }],
  soldOrIssuedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Merchandise', MerchandiseSchema);