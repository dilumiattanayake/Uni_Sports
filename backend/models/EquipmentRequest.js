const mongoose = require('mongoose');

const EquipmentRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    equipment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Must request at least 1 item']
    },
    // NEW: Track issues per item
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
    issueNote: {
      type: String
    }
  }],
  status: {
    type: String,
    // NEW: Added 'Issue Reported' and 'Returned with Issues'
    enum: ['Pending', 'Approved', 'Rejected', 'Borrowed', 'Issue Reported', 'Returned', 'Returned with Issues', 'Overdue'],
    default: 'Pending'
  },
  expectedReturnDate: {
    type: Date,
    required: [true, 'Please provide a return deadline']
  },
  actualReturnDate: {
    type: Date
  },
  notes: {
    type: String,
    maxLength: 500
  },
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User' 
  },
  qrPass: {
    token: {
      type: String
    },
    qrImage: {
      type: String
    },
    generatedAt: {
      type: Date
    },
    scannedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

EquipmentRequestSchema.index(
  { 'qrPass.token': 1 },
  {
    unique: true,
    partialFilterExpression: {
      'qrPass.token': { $type: 'string' }
    }
  }
);

module.exports = mongoose.model('EquipmentRequest', EquipmentRequestSchema);