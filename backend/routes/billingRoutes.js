const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  updateInvoice,
  deleteInvoice,
  getBillingStats,
} = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', authorize('Administrator', 'Accountant'), getBillingStats);

router.get(
  '/',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  getInvoices
);
router.get(
  '/:id',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  getInvoiceById
);

router.post(
  '/',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  createInvoice
);

router.post(
  '/:id/payment',
  authorize('Administrator', 'Accountant', 'Receptionist'),
  recordPayment
);

router.put(
  '/:id',
  authorize('Administrator', 'Accountant'),
  updateInvoice
);

router.delete(
  '/:id',
  authorize('Administrator'),
  deleteInvoice
);

module.exports = router;
