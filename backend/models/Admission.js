const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
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
      required: [true, 'Admitting doctor reference is required'],
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dischargeDate: {
      type: Date,
      default: null,
    },
    ward: {
      type: String,
      enum: [
        'General Ward',
        'Semi-Private Ward',
        'Private Suite',
        'ICU (Intensive Care)',
        'CCU (Cardiac Care)',
        'Emergency Ward',
        'Pediatric Ward',
        'Maternity Ward',
      ],
      default: 'General Ward',
      required: true,
    },
    roomNumber: {
      type: String,
      trim: true,
      required: [true, 'Room number is required'],
    },
    bedNumber: {
      type: String,
      trim: true,
      required: [true, 'Bed number is required'],
    },
    status: {
      type: String,
      enum: ['Admitted', 'Discharged', 'Transferred'],
      default: 'Admitted',
      index: true,
    },
    admissionReason: {
      type: String,
      trim: true,
      required: [true, 'Admission reason is required'],
    },
    diagnosis: {
      type: String,
      trim: true,
      default: '',
    },
    dischargeSummary: {
      type: String,
      trim: true,
      default: '',
    },
    dischargeCondition: {
      type: String,
      enum: ['Stable', 'Recovered', 'Referred', 'Against Medical Advice', 'Deceased', ''],
      default: '',
    },
    dailyRate: {
      type: Number,
      default: 150,
      min: 0,
    },
    nurseInCharge: {
      type: String,
      trim: true,
      default: '',
    },
    vitalsLog: [
      {
        recordedAt: { type: Date, default: Date.now },
        bloodPressure: { type: String, default: '' },
        heartRate: { type: Number, default: null },
        temperature: { type: Number, default: null },
        respiratoryRate: { type: Number, default: null },
        oxygenSaturation: { type: Number, default: null },
        notes: { type: String, default: '' },
        recordedBy: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

admissionSchema.index({ patient: 1, status: 1 });
admissionSchema.index({ ward: 1, status: 1 });

const Admission = mongoose.model('Admission', admissionSchema);
module.exports = Admission;
