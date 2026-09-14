const { User, USER_ROLES } = require('./User');
const Department = require('./Department');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Medicine = require('./Medicine');
const Prescription = require('./Prescription');
const LabTest = require('./LabTest');
const Invoice = require('./Invoice');
const Admission = require('./Admission');
const Staff = require('./Staff');
const AuditLog = require('./AuditLog');

module.exports = {
  User,
  USER_ROLES,
  Department,
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
  Medicine,
  Prescription,
  LabTest,
  Invoice,
  Admission,
  Staff,
  AuditLog,
};
