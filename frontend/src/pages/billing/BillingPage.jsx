import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt, Plus, Search, Eye, Edit3, Trash2,
  CheckCircle2, Clock, DollarSign, CreditCard, AlertCircle, X, Printer
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import { patientService } from '../../services/patientService';

export const BillingPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    paidCount: 0,
  });

  // Invoice form
  const [formData, setFormData] = useState({
    patient: '',
    items: [{ description: 'Specialist Consultation Fee', type: 'Consultation', quantity: 1, unitPrice: 100 }],
    discount: 0,
    taxRate: 0,
    notes: '',
  });

  // Payment form
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'Cash',
    notes: '',
  });

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: '', type: 'Consultation', quantity: 1, unitPrice: 50 }],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const computeSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);
  };

  const computeTotal = () => {
    const sub = computeSubtotal();
    const discount = Number(formData.discount) || 0;
    const taxable = Math.max(0, sub - discount);
    const taxAmt = taxable * ((Number(formData.taxRate) || 0) / 100);
    return taxable + taxAmt;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [invoicesRes, patientsRes, statsRes] = await Promise.all([
        billingService.getInvoices({
          paymentStatus: statusFilter || undefined,
          search: searchTerm || undefined,
        }),
        patientService.getPatients({ limit: 100 }),
        billingService.getStats().catch(() => null),
      ]);

      setInvoices(invoicesRes.data || []);
      setPatients(patientsRes.data || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      toast.error(err.message || 'Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenCreate = () => {
    setFormData({
      patient: patients[0]?._id || '',
      items: [{ description: 'Specialist Consultation Fee', type: 'Consultation', quantity: 1, unitPrice: 100 }],
      discount: 0,
      taxRate: 0,
      notes: '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      toast.error('Please select a patient');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Add at least one billing item');
      return;
    }

    setSubmitting(true);
    try {
      await billingService.createInvoice(formData);
      toast.success('Invoice generated successfully');
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayment = (invoice) => {
    setActiveInvoice(invoice);
    setPaymentData({
      amountPaid: String(invoice.balanceDue || 0),
      paymentMethod: 'Cash',
      notes: '',
    });
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!activeInvoice) return;

    const amount = Number(paymentData.amountPaid);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }

    setSubmitting(true);
    try {
      await billingService.recordPayment(activeInvoice._id, paymentData);
      toast.success('Payment recorded successfully');
      setIsPaymentOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (invoice) => {
    setActiveInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Delete invoice #${invoice.invoiceNumber}?`)) return;
    try {
      await billingService.deleteInvoice(invoice._id);
      toast.success('Invoice deleted');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete invoice');
    }
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      width: '130px',
      render: (r) => <strong style={{ color: 'var(--primary-600)' }}>{r.invoiceNumber}</strong>,
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (r) => (
        <div>
          <strong>{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'Walk-in Patient'}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.patient?.patientId} | {r.patient?.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total Bill',
      width: '110px',
      render: (r) => <strong>${Number(r.totalAmount || 0).toFixed(2)}</strong>,
    },
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      width: '110px',
      render: (r) => <span style={{ color: 'var(--success-600)' }}>${Number(r.amountPaid || 0).toFixed(2)}</span>,
    },
    {
      key: 'balanceDue',
      label: 'Balance Due',
      width: '110px',
      render: (r) => (
        <span style={{ color: r.balanceDue > 0 ? 'var(--danger-600)' : 'var(--text-muted)', fontWeight: r.balanceDue > 0 ? '600' : 'normal' }}>
          ${Number(r.balanceDue || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      width: '120px',
      render: (r) => {
        const variants = {
          Paid: 'badge-success',
          'Partially Paid': 'badge-warning',
          Unpaid: 'badge-danger',
        };
        return <span className={`badge ${variants[r.paymentStatus] || 'badge-neutral'}`}>{r.paymentStatus}</span>;
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      width: '110px',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '130px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            className="topbar-icon-btn"
            style={{ width: '28px', height: '28px' }}
            title="View & Print Invoice Receipt"
            onClick={() => handleOpenView(r)}
          >
            <Eye size={14} />
          </button>
          {r.balanceDue > 0 && hasRole('Administrator', 'Accountant', 'Receptionist') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--success-600)' }}
              title="Record Payment"
              onClick={() => handleOpenPayment(r)}
            >
              <CreditCard size={14} />
            </button>
          )}
          {hasRole('Administrator') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--danger-600)' }}
              title="Delete Invoice"
              onClick={() => handleDelete(r)}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Billing & Financial Transactions"
        subtitle="Patient invoices for clinical consultations, pathology investigations, pharmacy dispenses, and inpatient stays."
        icon={Receipt}
        breadcrumbs={[{ label: 'Billing' }]}
        badge="Live Financials"
        actions={
          hasRole('Administrator', 'Accountant', 'Receptionist') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
              <Plus size={15} /> Create Invoice
            </button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="metric-val">${Number(stats.totalInvoiced || 0).toLocaleString()}</div>
            <div className="metric-label">Total Invoiced</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-val">${Number(stats.totalCollected || 0).toLocaleString()}</div>
            <div className="metric-label">Revenue Collected</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">${Number(stats.totalOutstanding || 0).toLocaleString()}</div>
            <div className="metric-label">Outstanding Receivables</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Receipt size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.paidCount || 0}</div>
            <div className="metric-label">Invoices Fully Settled</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              placeholder="Search by invoice number (e.g. INV-2026-0001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Payment Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid / Due</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading invoice records..." />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          emptyTitle="No Invoices Found"
          emptyMessage="No billing records match criteria. Click 'Create Invoice' to bill a patient."
        />
      )}

      {/* CREATE INVOICE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Patient Invoice"
        maxWidth="750px"
      >
        <form onSubmit={handleCreateInvoice}>
          <FormGroup label="Patient" required>
            <Select
              required
              options={patients.map((p) => ({
                value: p._id,
                label: `${p.firstName} ${p.lastName} (${p.patientId}) - ${p.phone}`,
              }))}
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
            />
          </FormGroup>

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Billable Charge Items:
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {formData.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.3fr 0.8fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Service / Medicine / Test description"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  required
                />
                <select
                  className="form-select"
                  value={item.type}
                  onChange={(e) => updateItem(idx, 'type', e.target.value)}
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Laboratory">Laboratory Test</option>
                  <option value="Pharmacy">Pharmacy / Medicine</option>
                  <option value="Admission">Admission / Ward</option>
                  <option value="Other">Other Service</option>
                </select>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="Price ($)"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                  required
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-500)', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={addItem}
            style={{ marginBottom: '1.25rem' }}
          >
            <Plus size={14} /> Add Charge Item
          </button>

          {/* Pricing summary */}
          <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            <FormGrid>
              <FormGroup label="Discount Amount ($)">
                <Input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                />
              </FormGroup>

              <FormGroup label="Tax Rate (%)">
                <Input
                  type="number"
                  min="0"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                />
              </FormGroup>
            </FormGrid>

            <div style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '1.1rem' }}>
              <strong>Grand Total: ${computeTotal().toFixed(2)}</strong>
            </div>
          </div>

          <FormGroup label="Billing Notes / Insurance Claim Details">
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Co-pay required, Medicare ref #..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={`Record Payment for ${activeInvoice?.invoiceNumber}`}
        maxWidth="440px"
      >
        <form onSubmit={handleRecordPayment}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
            <div>Total Bill: <strong>${Number(activeInvoice?.totalAmount || 0).toFixed(2)}</strong></div>
            <div>Already Paid: <strong>${Number(activeInvoice?.amountPaid || 0).toFixed(2)}</strong></div>
            <div style={{ color: 'var(--danger-600)', marginTop: '0.25rem' }}>
              Outstanding Balance: <strong>${Number(activeInvoice?.balanceDue || 0).toFixed(2)}</strong>
            </div>
          </div>

          <FormGroup label="Payment Amount ($)" required>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={paymentData.amountPaid}
              onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Payment Method" required>
            <Select
              required
              options={[
                { value: 'Cash', label: 'Cash Currency' },
                { value: 'Credit Card', label: 'Credit Card' },
                { value: 'Debit Card', label: 'Debit Card' },
                { value: 'Online', label: 'Online UPI / Bank Transfer' },
                { value: 'Insurance', label: 'Direct Insurance Settlement' },
              ]}
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Payment Remarks">
            <Input
              placeholder="Transaction ID / Receipt ref..."
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW & PRINT RECEIPT MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Hospital Invoice / Receipt - ${activeInvoice?.invoiceNumber}`}
        maxWidth="720px"
      >
        {activeInvoice && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--slate-200)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-700)' }}>CAREPULSE MEDICAL HOSPITAL</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  100 Healthcare Way, Metro City | Phone: +1 (555) 019-2831
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>{activeInvoice.invoiceNumber}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Date: {new Date(activeInvoice.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
              <div>
                <strong>Billed To:</strong>
                <div>{activeInvoice.patient?.firstName} {activeInvoice.patient?.lastName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Patient ID: {activeInvoice.patient?.patientId} | Phone: {activeInvoice.patient?.phone}
                </div>
              </div>
              <div>
                <strong>Payment Information:</strong>
                <div>Status: <span className={`badge ${activeInvoice.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{activeInvoice.paymentStatus}</span></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Method: {activeInvoice.paymentMethod}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--slate-100)', textAlign: 'left', fontSize: '0.8rem' }}>
                  <th style={{ padding: '0.5rem' }}>Item Description</th>
                  <th style={{ padding: '0.5rem' }}>Category</th>
                  <th style={{ padding: '0.5rem' }}>Qty</th>
                  <th style={{ padding: '0.5rem' }}>Unit Price</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {activeInvoice.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--slate-100)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '0.5rem' }}>{item.description}</td>
                    <td style={{ padding: '0.5rem' }}><span className="badge badge-neutral">{item.type}</span></td>
                    <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                    <td style={{ padding: '0.5rem' }}>${Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>${Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', fontSize: '0.9rem' }}>
              <div>Subtotal: <strong>${Number(activeInvoice.subtotal || 0).toFixed(2)}</strong></div>
              {activeInvoice.discount > 0 && <div>Discount: -${Number(activeInvoice.discount).toFixed(2)}</div>}
              {activeInvoice.taxAmount > 0 && <div>Tax ({activeInvoice.taxRate}%): +${Number(activeInvoice.taxAmount).toFixed(2)}</div>}
              <div style={{ fontSize: '1.15rem', color: 'var(--primary-700)', borderTop: '1px solid var(--slate-300)', paddingTop: '0.35rem' }}>
                Grand Total: <strong>${Number(activeInvoice.totalAmount || 0).toFixed(2)}</strong>
              </div>
              <div style={{ color: 'var(--success-600)' }}>Amount Settled: ${Number(activeInvoice.amountPaid || 0).toFixed(2)}</div>
              <div style={{ color: activeInvoice.balanceDue > 0 ? 'var(--danger-600)' : 'var(--text-muted)', fontWeight: 600 }}>
                Balance Outstanding: ${Number(activeInvoice.balanceDue || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsViewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BillingPage;
