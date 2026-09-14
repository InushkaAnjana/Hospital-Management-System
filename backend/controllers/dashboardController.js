const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Admission = require('../models/Admission');
const LabTest = require('../models/LabTest');
const Medicine = require('../models/Medicine');
const Invoice = require('../models/Invoice');
const Staff = require('../models/Staff');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/dashboard/stats
 * Aggregate live KPI metrics across HMS modules
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      todayAppointments,
      admittedPatients,
      pendingLabTests,
      lowStockMedicines,
      todayRevenueAgg,
      totalDoctors,
      totalStaff,
    ] = await Promise.all([
      Patient.countDocuments({ status: 'Active' }),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lte: todayEnd },
        status: { $nin: ['Cancelled'] },
      }),
      Admission.countDocuments({ status: 'Admitted' }),
      LabTest.countDocuments({ status: { $in: ['Ordered', 'Sample Collected', 'Processing'] } }),
      Medicine.countDocuments({ status: { $in: ['Low Stock', 'Out of Stock'] } }),
      Invoice.aggregate([
        { $match: { paymentDate: { $gte: today, $lte: todayEnd }, paymentStatus: { $in: ['Paid', 'Partially Paid'] } } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
      ]),
      Doctor.countDocuments({ isActive: true }),
      Staff.countDocuments({ status: 'Active' }),
    ]);

    // Recent activities (Appointments, Lab orders, Invoices)
    const [recentAppointments, recentInvoices, recentAdmissions] = await Promise.all([
      Appointment.find()
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'name specialization')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('appointmentNumber patient doctor appointmentDate status reason'),
      Invoice.find()
        .populate('patient', 'firstName lastName patientId')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber patient totalAmount amountPaid paymentStatus createdAt'),
      Admission.find({ status: 'Admitted' })
        .populate('patient', 'firstName lastName patientId')
        .populate('doctor', 'name')
        .sort({ admissionDate: -1 })
        .limit(5)
        .select('admissionNumber patient doctor ward bedNumber admissionDate status'),
    ]);

    // Monthly patient trend (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const patientTrend = await Patient.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return sendSuccess(res, 'Dashboard stats retrieved successfully', {
      kpis: {
        totalPatients,
        todayAppointments,
        admittedPatients,
        pendingLabTests,
        lowStockMedicines,
        todayRevenue: todayRevenueAgg[0]?.total || 0,
        totalDoctors,
        totalStaff,
      },
      recentAppointments,
      recentInvoices,
      recentAdmissions,
      patientTrend,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
