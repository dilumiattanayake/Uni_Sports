const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Please add the equipment name'],
    trim: true
  },
  sport: {
    type: mongoose.Schema.ObjectId,
    ref: 'Sport',
    required: [true, 'Please assign the equipment to a sport']
  },
  image: {
    type: String,
    default: 'no-photo.jpg' // Default placeholder if no image is uploaded
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Please add the total quantity'],
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: function() {
      return this.totalQuantity;
    }
  },
  damagedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lostQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: mongoose.Schema.ObjectId,
    ref: 'Location',
    required: [true, 'Please assign a storage location']
  },
  status: {
    type: String,
    enum: ['Available', 'Out of Stock', 'Under Maintenance'],
    default: 'Available'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  waitlist: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

InventorySchema.index({ 'waitlist.student': 1 });

InventorySchema.pre('save', function(next) {
  if (this.availableQuantity <= 0) {
    this.status = 'Out of Stock';
  } else {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Inventory', InventorySchema);