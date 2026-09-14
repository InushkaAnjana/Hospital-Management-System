const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: [true, 'Appointment number is required'],
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g. 09:00 AM - 09:30 AM)'],
      trim: true,
    },
    tokenNumber: {
      type: Number,
      default: 1,
    },
    reason: {
      type: String,
      trim: true,
      default: 'Routine Consultation',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'In-Consultation', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index to optimize queries for doctor daily schedule
appointmentSchema.index({ doctor: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
