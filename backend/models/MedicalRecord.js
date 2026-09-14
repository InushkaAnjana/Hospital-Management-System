const mongoose = require('mongoose');

const vitalSignsSchema = new mongoose.Schema(
  {
    bloodPressure: { type: String, default: '' }, // e.g. "120/80 mmHg"
    pulseRate: { type: Number, default: null },   // e.g. 72 bpm
    temperature: { type: Number, default: null }, // e.g. 98.6 F
    respiratoryRate: { type: Number, default: null }, // e.g. 16 bpm
    weight: { type: Number, default: null },      // e.g. 70 kg
    height: { type: Number, default: null },      // e.g. 175 cm
    oxygenSaturation: { type: Number, default: null }, // e.g. 98%
  },
  { _id: false }
);

const treatmentHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    treatment: { type: String, required: true },
    doctorNotes: { type: String, default: '' },
  },
  { _id: true }
);

const medicalReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['Lab Test', 'Radiology / X-Ray', 'ECG / Echo', 'Biopsy', 'Other'],
      default: 'Lab Test',
    },
    fileUrl: { type: String, required: true },
    summary: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: [true, 'Record ID is required'],
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
      required: [true, 'Attending doctor is required'],
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    diagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis is required'],
      trim: true,
      index: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    clinicalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    vitalSigns: {
      type: vitalSignsSchema,
      default: () => ({}),
    },
    treatmentHistory: [treatmentHistorySchema],
    reports: [medicalReportSchema],
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
