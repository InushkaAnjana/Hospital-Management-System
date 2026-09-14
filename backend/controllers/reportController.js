const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Admission = require('../models/Admission');
const LabTest = require('../models/LabTest');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Staff = require('../models/Staff');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Patient Analytics & Report
 * GET /api/reports/patients
 */
const getPatientReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [totalRegistered, byGender, byBloodGroup, recentPatients] = await Promise.all([
      Patient.countDocuments(query),
      Patient.aggregate([
        { $match: query },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      Patient.aggregate([
        { $match: query },
        { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      ]),
      Patient.find(query).sort({ createdAt: -1 }).limit(20).select('patientId firstName lastName gender age bloodGroup createdAt'),
    ]);

    return sendSuccess(res, 'Patient report generated successfully', {
      totalRegistered,
      byGender,
      byBloodGroup,
      recentPatients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Appointment Analytics & Report
 * GET /api/reports/appointments
 */
const getAppointmentReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 ? { appointmentDate: dateFilter } : {};

    const [totalAppointments, byStatus, byDoctor] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: query },
        { $group: { _id: '$doctor', count: { $sum: 1 } } },
        { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
        { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
        { $project: { doctorName: '$doctorInfo.name', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return sendSuccess(res, 'Appointment report generated successfully', {
      totalAppointments,
      byStatus,
      byDoctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Financial & Revenue Report
 * GET /api/reports/revenue
 */
const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [totalRevenueAgg, byPaymentStatus, byServiceType, invoices] = await Promise.all([
      Invoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$totalAmount' },
            totalCollected: { $sum: '$amountPaid' },
            totalOutstanding: { $sum: '$balanceDue' },
          },
        },
      ]),
      Invoice.aggregate([
        { $match: query },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
      ]),
      Invoice.aggregate([
        { $match: query },
        { $unwind: '$items' },
        { $group: { _id: '$items.type', totalAmount: { $sum: '$items.total' }, count: { $sum: 1 } } },
        { $sort: { totalAmount: -1 } },
      ]),
      Invoice.find(query)
        .populate('patient', 'patientId firstName lastName')
        .sort({ createdAt: -1 })
        .limit(20)
        .select('invoiceNumber patient totalAmount amountPaid paymentStatus paymentMethod createdAt'),
    ]);

    return sendSuccess(res, 'Revenue report generated successfully', {
      totals: totalRevenueAgg[0] || { totalBilled: 0, totalCollected: 0, totalOutstanding: 0 },
      byPaymentStatus,
      byServiceType,
      recentInvoices: invoices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pharmacy & Inventory Report
 * GET /api/reports/pharmacy
 */
const getPharmacyReport = async (req, res, next) => {
  try {
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    const [totalMedicines, byCategory, lowStockItems, expiringItems, totalDispensed] = await Promise.all([
      Medicine.countDocuments(),
      Medicine.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stockQuantity' } } },
      ]),
      Medicine.find({ status: { $in: ['Low Stock', 'Out of Stock'] } }).select('itemCode name genericName category stockQuantity reorderLevel status'),
      Medicine.find({ expiryDate: { $lte: sixtyDaysLater } }).select('itemCode name expiryDate stockQuantity status'),
      Prescription.countDocuments({ status: 'Dispensed' }),
    ]);

    return sendSuccess(res, 'Pharmacy report generated successfully', {
      totalMedicines,
      byCategory,
      lowStockItems,
      expiringItems,
      totalDispensed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Laboratory Report
 * GET /api/reports/laboratory
 */
const getLabReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [totalTests, byStatus, byPriority, byCategory, recentTests] = await Promise.all([
      LabTest.countDocuments(query),
      LabTest.aggregate([{ $match: query }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      LabTest.aggregate([{ $match: query }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      LabTest.aggregate([{ $match: query }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
      LabTest.find(query)
        .populate('patient', 'patientId firstName lastName')
        .sort({ createdAt: -1 })
        .limit(15)
        .select('testCode testName category priority status completedAt createdAt'),
    ]);

    return sendSuccess(res, 'Laboratory report generated successfully', {
      totalTests,
      byStatus,
      byPriority,
      byCategory,
      recentTests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff & HR Report
 * GET /api/reports/staff
 */
const getStaffReport = async (req, res, next) => {
  try {
    const [totalStaff, byRole, byDepartment, byShift] = await Promise.all([
      Staff.countDocuments(),
      Staff.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Staff.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        { $project: { departmentName: '$dept.name', count: 1 } },
      ]),
      Staff.aggregate([{ $group: { _id: '$shift', count: { $sum: 1 } } }]),
    ]);

    return sendSuccess(res, 'Staff report generated successfully', {
      totalStaff,
      byRole,
      byDepartment,
      byShift,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientReport,
  getAppointmentReport,
  getRevenueReport,
  getPharmacyReport,
  getLabReport,
  getStaffReport,
};
