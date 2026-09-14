const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ['ID Proof', 'Lab Report', 'Discharge Summary', 'Prescription', 'Insurance', 'Other'],
      default: 'Other',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Invalid age entered'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    medicalHistory: {
      chronicConditions: {
        type: [String],
        default: [],
      },
      allergies: {
        type: [String],
        default: [],
      },
      pastSurgeries: {
        type: [String],
        default: [],
      },
      notes: {
        type: String,
        default: '',
      },
    },
    documents: [documentSchema],
    status: {
      type: String,
      enum: ['Active', 'Discharged', 'Deceased'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Compound index for quick text/search lookups
patientSchema.index({ firstName: 'text', lastName: 'text', phone: 'text', patientId: 'text' });

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
