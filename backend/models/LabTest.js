const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    testCode: {
      type: String,
      required: [true, 'Lab test code is required'],
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
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
      index: true,
    },
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General Pathology',
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Routine',
      index: true,
    },
    status: {
      type: String,
      enum: ['Ordered', 'Sample Collected', 'Processing', 'Completed', 'Cancelled'],
      default: 'Ordered',
      index: true,
    },
    sampleType: {
      type: String,
      trim: true,
      default: 'Blood',
    },
    sampleCollectedAt: {
      type: Date,
      default: null,
    },
    sampleCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    results: [
      {
        parameter: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String, default: '' },
        referenceRange: { type: String, default: '' },
        status: { type: String, enum: ['Normal', 'Low', 'High', 'Critical'], default: 'Normal' },
      },
    ],
    technicianNotes: {
      type: String,
      trim: true,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

labTestSchema.index({ patient: 1, status: 1 });
labTestSchema.index({ createdAt: -1 });

const LabTest = mongoose.model('LabTest', labTestSchema);
module.exports = LabTest;
