const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: [true, 'Medicine item code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Brand / Commercial name is required'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      required: [true, 'Generic chemical name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Medicine category is required'],
      trim: true,
      default: 'General',
    },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Inhaler', 'Drops'],
      default: 'Tablet',
    },
    strength: {
      type: String,
      trim: true,
      default: '500mg',
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    manufacturer: {
      type: String,
      trim: true,
      default: 'CarePulse Pharmaceuticals',
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto calculate status before saving
medicineSchema.pre('save', function () {
  if (this.stockQuantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stockQuantity <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
