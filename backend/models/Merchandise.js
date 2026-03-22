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
    default: 'no-photo.jpg' // Default placeholder if no image is uploaded
  },
  category: {
    type: String,
    required: true,
    enum: ['Apparel', 'Team Kit', 'Accessories', 'Footwear', 'Other'] 
  },
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'N/A'],
    default: 'N/A' 
  },
  price: {
    type: Number,
    required: true,
    default: 0 
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add the total stock quantity'],
    min: 0
  },
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