const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { logActivity } = require('../utils/auditLogger');

/**
 * Generate Invoice Number (e.g. INV-2026-0001)
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get Invoices
 * GET /api/billing
 */
const getInvoices = async (req, res, next) => {
  try {
    const { patient, paymentStatus, paymentMethod, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (search) {
      filter.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .populate('patient', 'patientId firstName lastName phone email age gender address')
      .populate('appointment', 'appointmentNumber appointmentDate')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(res, 'Invoices retrieved successfully', invoices, 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Invoice
 * GET /api/billing/:id
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient')
      .populate('appointment')
      .populate('createdBy', 'name role');

    if (!invoice) {
      return next(ApiError.notFound('Invoice record not found.'));
    }

    return sendSuccess(res, 'Invoice details retrieved', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Invoice
 * POST /api/billing
 */
const createInvoice = async (req, res, next) => {
  try {
    const {
      patient,
      appointment,
      items,
      discount = 0,
      taxRate = 0,
      amountPaid = 0,
      paymentMethod = 'Cash',
      notes = '',
    } = req.body;

    if (!patient || !items || !Array.isArray(items) || items.length === 0) {
      return next(ApiError.badRequest('Patient and at least one billable item are required.'));
    }

    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) return next(ApiError.badRequest('Patient not found.'));

    // Process items and compute subtotal
    const processedItems = items.map((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      return {
        description: item.description || 'Medical Service',
        type: item.type || 'Consultation',
        quantity: qty,
        unitPrice: price,
        total: qty * price,
      };
    });

    const subtotal = processedItems.reduce((acc, curr) => acc + curr.total, 0);
    const disc = Number(discount) || 0;
    const taxR = Number(taxRate) || 0;
    const taxable = Math.max(0, subtotal - disc);
    const taxAmount = (taxable * taxR) / 100;
    const totalAmount = taxable + taxAmount;

    const paid = Number(amountPaid) || 0;
    const balanceDue = Math.max(0, totalAmount - paid);

    let paymentStatus = 'Unpaid';
    if (paid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'Paid';
    } else if (paid > 0) {
      paymentStatus = 'Partially Paid';
    }

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      patient,
      appointment: appointment || null,
      items: processedItems,
      subtotal,
      discount: disc,
      taxRate: taxR,
      taxAmount,
      totalAmount,
      amountPaid: paid,
      balanceDue,
      paymentStatus,
      paymentMethod: paid > 0 ? paymentMethod : 'Pending',
      paymentDate: paid > 0 ? new Date() : null,
      notes,
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await Invoice.findById(invoice._id).populate(
      'patient',
      'patientId firstName lastName phone'
    );

    await logActivity(req, {
      action: 'CREATE',
      module: 'Billing',
      description: `Generated invoice ${invoiceNumber} for patient ${patientDoc.firstName} ${patientDoc.lastName} with total $${totalAmount.toFixed(2)}`,
    });

    return sendSuccess(res, 'Invoice created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Record Payment
 * POST /api/billing/:id/payment
 */
const recordPayment = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod = 'Cash', notes } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate('patient', 'firstName lastName');

    if (!invoice) {
      return next(ApiError.notFound('Invoice not found.'));
    }

    const additionalPayment = Number(amountPaid);
    if (!additionalPayment || additionalPayment <= 0) {
      return next(ApiError.badRequest('Valid payment amount is required.'));
    }

    const newTotalPaid = invoice.amountPaid + additionalPayment;
    invoice.amountPaid = newTotalPaid;
    invoice.balanceDue = Math.max(0, invoice.totalAmount - newTotalPaid);
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = new Date();

    if (newTotalPaid >= invoice.totalAmount) {
      invoice.paymentStatus = 'Paid';
    } else {
      invoice.paymentStatus = 'Partially Paid';
    }

    if (notes) {
      invoice.notes = invoice.notes ? `${invoice.notes} | ${notes}` : notes;
    }

    await invoice.save();

    await logActivity(req, {
      action: 'RECORD_PAYMENT',
      module: 'Billing',
      description: `Recorded payment of $${additionalPayment.toFixed(2)} via ${paymentMethod} for invoice ${invoice.invoiceNumber}`,
    });

    return sendSuccess(res, 'Payment recorded successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Invoice
 * PUT /api/billing/:id
 */
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(ApiError.notFound('Invoice not found.'));
    }

    Object.assign(invoice, req.body);
    await invoice.save();

    return sendSuccess(res, 'Invoice updated successfully', invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Invoice
 * DELETE /api/billing/:id
 */
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return next(ApiError.notFound('Invoice not found.'));
    }
    return sendSuccess(res, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Billing Stats
 * GET /api/billing/stats
 */
const getBillingStats = async (req, res, next) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceDue' },
          count: { $sum: 1 },
        },
      },
    ]);

    const paidCount = await Invoice.countDocuments({ paymentStatus: 'Paid' });
    const unpaidCount = await Invoice.countDocuments({ paymentStatus: { $in: ['Unpaid', 'Partially Paid'] } });

    const result = stats[0] || { totalInvoiced: 0, totalCollected: 0, totalOutstanding: 0, count: 0 };

    return sendSuccess(res, 'Billing statistics retrieved', {
      ...result,
      paidCount,
      unpaidCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  updateInvoice,
  deleteInvoice,
  getBillingStats,
};
