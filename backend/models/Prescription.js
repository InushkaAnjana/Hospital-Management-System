const mongoose = require('mongoose');

const prescribedItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
    },
    dosage: {
      type: String, // e.g. "1 Tablet", "10ml"
      required: true,
    },
    frequency: {
      type: String, // e.g. "Three times daily (TID)"
      required: true,
    },
    duration: {
      type: String, // e.g. "7 Days"
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    instructions: {
      type: String, // e.g. "Take after meals"
      default: '',
    },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      required: [true, 'Prescription number is required'],
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
      default: null,
    },
    diagnosis: {
      type: String,
      default: '',
    },
    medicines: {
      type: [prescribedItemSchema],
      validate: [
        (val) => val && val.length > 0,
        'At least one prescribed medicine is required',
      ],
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Dispensed', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    dispensedAt: {
      type: Date,
      default: null,
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
