const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Late', 'On Leave'],
    default: 'Present',
  },
  checkIn: {
    type: String,
    default: '09:00 AM',
  },
  checkOut: {
    type: String,
    default: '05:00 PM',
  },
  notes: {
    type: String,
    default: '',
  },
});

const leaveRecordSchema = new mongoose.Schema({
  leaveType: {
    type: String,
    enum: ['Casual', 'Sick', 'Annual', 'Maternity', 'Emergency'],
    default: 'Casual',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  adminRemarks: {
    type: String,
    default: '',
  },
});

const staffSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: [
        'Administrator',
        'Doctor',
        'Nurse',
        'Receptionist',
        'Laboratory Staff',
        'Pharmacist',
        'Accountant',
        'Paramedic',
        'Support Staff',
      ],
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
      min: 0,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotational'],
      default: 'Morning',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Resigned', 'Terminated'],
      default: 'Active',
      index: true,
    },
    attendance: [attendanceRecordSchema],
    leaveRecords: [leaveRecordSchema],
    emergencyContact: {
      name: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

staffSchema.index({ department: 1, role: 1 });

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;
