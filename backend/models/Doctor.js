const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "13:00"
      required: true,
    },
    maxPatients: {
      type: Number,
      default: 15,
      min: 1,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    doctorCode: {
      type: String,
      required: [true, 'Doctor code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required (e.g. Dr. Jane Smith)'],
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    specialization: {
      type: String,
      required: [true, 'Medical specialization is required'],
      trim: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Assigned department is required'],
      index: true,
    },
    qualifications: {
      type: String,
      trim: true,
      default: 'MBBS, MD',
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
      default: 50,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    timeSlots: {
      type: [timeSlotSchema],
      default: [
        { startTime: '09:00 AM', endTime: '12:00 PM', maxPatients: 10 },
        { startTime: '02:00 PM', endTime: '05:00 PM', maxPatients: 10 },
      ],
    },
    status: {
      type: String,
      enum: ['Available', 'On Duty', 'In Surgery', 'On Leave'],
      default: 'Available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
