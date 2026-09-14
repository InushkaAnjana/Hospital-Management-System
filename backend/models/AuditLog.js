const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System / Guest',
    },
    userRole: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'DISCHARGE',
        'DISPENSE',
        'COLLECT_SAMPLE',
        'ENTER_RESULT',
        'RECORD_PAYMENT',
        'APPROVE_LEAVE',
      ],
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: [
        'Auth',
        'Patients',
        'Appointments',
        'Doctors',
        'Departments',
        'MedicalRecords',
        'Prescriptions',
        'Pharmacy',
        'Laboratory',
        'Billing',
        'Admissions',
        'Staff',
        'System',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
