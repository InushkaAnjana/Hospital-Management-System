const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Consultation', 'Laboratory', 'Pharmacy', 'Admission', 'Other'],
    default: 'Consultation',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Refunded'],
      default: 'Unpaid',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'Online', 'Pending'],
      default: 'Cash',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ patient: 1, paymentStatus: 1 });
invoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
