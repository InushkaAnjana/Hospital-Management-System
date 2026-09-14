import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical, Plus, Search, Eye, Edit3, Trash2,
  CheckCircle2, Clock, AlertTriangle, Microscope, X,
  Activity, FileText, Droplets, Printer
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { labService } from '../../services/labService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

export const LaboratoryPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    ordered: 0,
    collected: 0,
    completed: 0,
    urgent: 0,
  });

  // Order form
  const [orderForm, setOrderForm] = useState({
    patient: '',
    doctor: '',
    testName: '',
    category: 'Hematology',
    priority: 'Routine',
    sampleType: 'Blood',
    cost: 50,
    technicianNotes: '',
  });

  // Results form
  const [resultRows, setResultRows] = useState([
    { parameter: '', value: '', unit: '', referenceRange: '', status: 'Normal' },
  ]);
  const [resultNotes, setResultNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [testsRes, patientsRes, docsRes, statsRes] = await Promise.all([
        labService.getLabTests({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          search: searchTerm || undefined,
        }),
        patientService.getPatients({ limit: 100 }),
        doctorService.getDoctors(),
        labService.getStats().catch(() => null),
      ]);

      setTests(testsRes.data || []);
      setPatients(patientsRes.data || []);
      setDoctors(docsRes || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      toast.error(err.message || 'Failed to load laboratory data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenOrder = () => {
    setOrderForm({
      patient: patients[0]?._id || '',
      doctor: doctors[0]?._id || '',
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      priority: 'Routine',
      sampleType: 'Blood',
      cost: 45,
      technicianNotes: '',
    });
    setIsOrderModalOpen(true);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.patient || !orderForm.doctor || !orderForm.testName) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await labService.createLabTest(orderForm);
      toast.success('Lab test ordered successfully');
      setIsOrderModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to order lab test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCollectSample = async (test) => {
    if (!window.confirm(`Confirm collection of ${test.sampleType} sample for ${test.testCode}?`)) return;
    try {
      await labService.collectSample(test._id);
      toast.success('Sample collection logged');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to record sample collection');
    }
  };

  const handleOpenEnterResult = (test) => {
    setActiveTest(test);
    if (test.results && test.results.length > 0) {
      setResultRows(test.results);
    } else {
      setResultRows([
        { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Normal' },
        { parameter: 'WBC Count', value: '7,500', unit: '/mcL', referenceRange: '4,000 - 11,000', status: 'Normal' },
        { parameter: 'Platelets', value: '250,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'Normal' },
      ]);
    }
    setResultNotes(test.technicianNotes || '');
    setIsResultModalOpen(true);
  };

  const handleAddResultRow = () => {
    setResultRows([...resultRows, { parameter: '', value: '', unit: '', referenceRange: '', status: 'Normal' }]);
  };

  const handleRemoveResultRow = (idx) => {
    setResultRows(resultRows.filter((_, i) => i !== idx));
  };

  const handleResultRowChange = (idx, field, val) => {
    const updated = [...resultRows];
    updated[idx][field] = val;
    setResultRows(updated);
  };

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    if (!activeTest) return;

    setSubmitting(true);
    try {
      await labService.enterResult(activeTest._id, {
        results: resultRows,
        technicianNotes: resultNotes,
      });
      toast.success('Lab results saved and test finalized');
      setIsResultModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save results');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (test) => {
    setActiveTest(test);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (test) => {
    if (!window.confirm(`Delete lab order ${test.testCode}?`)) return;
    try {
      await labService.deleteLabTest(test._id);
      toast.success('Lab order deleted');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete order');
    }
  };

  const columns = [
    {
      key: 'testCode',
      label: 'Test ID',
      width: '120px',
      render: (r) => <strong style={{ color: 'var(--primary-600)' }}>{r.testCode}</strong>,
    },
    {
      key: 'patient',
      label: 'Patient Name',
      render: (r) => (
        <div>
          <strong>{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'Unknown Patient'}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.patient?.patientId} | {r.patient?.age}y | {r.patient?.bloodGroup}
          </div>
        </div>
      ),
    },
    {
      key: 'testName',
      label: 'Investigation',
      render: (r) => (
        <div>
          <strong>{r.testName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.category} ({r.sampleType})
          </div>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Prescribed By',
      render: (r) => r.doctor?.name || 'Assigned Doctor',
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '100px',
      render: (r) => {
        const badgeClass =
          r.priority === 'Emergency' ? 'badge-danger' : r.priority === 'Urgent' ? 'badge-warning' : 'badge-neutral';
        return <span className={`badge ${badgeClass}`}>{r.priority}</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (r) => {
        const badgeClass =
          r.status === 'Completed'
            ? 'badge-success'
            : r.status === 'Sample Collected'
            ? 'badge-primary'
            : r.status === 'Processing'
            ? 'badge-warning'
            : 'badge-neutral';
        return <span className={`badge ${badgeClass}`}>{r.status}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            className="topbar-icon-btn"
            style={{ width: '28px', height: '28px' }}
            title="View Details / Print Report"
            onClick={() => handleOpenView(r)}
          >
            <Eye size={14} />
          </button>

          {r.status === 'Ordered' && hasRole('Administrator', 'Laboratory Staff', 'Nurse') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--primary-600)' }}
              title="Collect Sample"
              onClick={() => handleCollectSample(r)}
            >
              <Droplets size={14} />
            </button>
          )}

          {['Sample Collected', 'Processing', 'Ordered'].includes(r.status) &&
            hasRole('Administrator', 'Laboratory Staff') && (
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px', color: 'var(--success-600)' }}
                title="Enter Lab Results"
                onClick={() => handleOpenEnterResult(r)}
              >
                <Edit3 size={14} />
              </button>
            )}

          {hasRole('Administrator') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--danger-600)' }}
              title="Delete Order"
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
        title="Laboratory & Diagnostic Services"
        subtitle="Pathology orders, specimen sample collection, clinical parameter entry, and diagnostic reports."
        icon={FlaskConical}
        breadcrumbs={[{ label: 'Laboratory' }]}
        badge="Live Lab"
        actions={
          hasRole('Administrator', 'Doctor') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenOrder}>
              <Plus size={15} /> Order Lab Test
            </button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Microscope size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.total}</div>
            <div className="metric-label">Total Lab Orders</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.ordered}</div>
            <div className="metric-label">Awaiting Samples</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Droplets size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.collected}</div>
            <div className="metric-label">Samples In Processing</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.completed}</div>
            <div className="metric-label">Reports Finalized</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.urgent}</div>
            <div className="metric-label">Urgent / Stat Orders</div>
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
              placeholder="Search by test code, test name, category..."
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
              <option value="">All Statuses</option>
              <option value="Ordered">Ordered (Pending)</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading laboratory records..." />
      ) : (
        <DataTable
          columns={columns}
          data={tests}
          emptyTitle="No Lab Tests Found"
          emptyMessage="No laboratory requests match the selected filters. Click 'Order Lab Test' to request a test."
        />
      )}

      {/* ORDER LAB TEST MODAL */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Order Clinical Laboratory Test"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateOrder}>
          <FormGrid>
            <FormGroup label="Select Patient" required>
              <Select
                required
                options={patients.map((p) => ({
                  value: p._id,
                  label: `${p.firstName} ${p.lastName} (${p.patientId})`,
                }))}
                value={orderForm.patient}
                onChange={(e) => setOrderForm({ ...orderForm, patient: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Prescribing Doctor" required>
              <Select
                required
                options={doctors.map((d) => ({
                  value: d._id,
                  label: `Dr. ${d.name} (${d.specialization})`,
                }))}
                value={orderForm.doctor}
                onChange={(e) => setOrderForm({ ...orderForm, doctor: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Investigation Name" required>
              <Input
                required
                placeholder="e.g. Complete Blood Count (CBC)"
                value={orderForm.testName}
                onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Department / Category">
              <Select
                options={[
                  { value: 'Hematology', label: 'Hematology' },
                  { value: 'Biochemistry', label: 'Biochemistry' },
                  { value: 'Microbiology', label: 'Microbiology' },
                  { value: 'Radiology', label: 'Radiology / Imaging' },
                  { value: 'Pathology', label: 'Histopathology' },
                  { value: 'Immunology', label: 'Immunology & Serology' },
                ]}
                value={orderForm.category}
                onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Priority Level">
              <Select
                options={[
                  { value: 'Routine', label: 'Routine (Standard turnaround)' },
                  { value: 'Urgent', label: 'Urgent (Within 4 hours)' },
                  { value: 'Emergency', label: 'Emergency / Stat (Immediate)' },
                ]}
                value={orderForm.priority}
                onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Specimen Sample Type">
              <Select
                options={[
                  { value: 'Blood', label: 'Venous Blood' },
                  { value: 'Serum', label: 'Blood Serum' },
                  { value: 'Urine', label: 'Clean-Catch Urine' },
                  { value: 'Sputum', label: 'Sputum' },
                  { value: 'Swab', label: 'Nasal / Throat Swab' },
                  { value: 'Stool', label: 'Stool Sample' },
                ]}
                value={orderForm.sampleType}
                onChange={(e) => setOrderForm({ ...orderForm, sampleType: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Standard Test Fee ($)">
              <Input
                type="number"
                min="0"
                value={orderForm.cost}
                onChange={(e) => setOrderForm({ ...orderForm, cost: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup label="Clinical / Pre-Analytical Notes" style={{ marginTop: '0.75rem' }}>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Fasting 8 hours required, patient on anticoagulants..."
              value={orderForm.technicianNotes}
              onChange={(e) => setOrderForm({ ...orderForm, technicianNotes: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Placing Order...' : 'Place Lab Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ENTER RESULTS MODAL */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Enter Diagnostic Results - ${activeTest?.testCode}`}
        maxWidth="750px"
      >
        <form onSubmit={handleSubmitResults}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
            <strong>Investigation:</strong> {activeTest?.testName} | <strong>Patient:</strong>{' '}
            {activeTest?.patient?.firstName} {activeTest?.patient?.lastName} ({activeTest?.patient?.patientId})
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--slate-200)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem' }}>Parameter</th>
                <th style={{ padding: '0.5rem' }}>Observed Value</th>
                <th style={{ padding: '0.5rem' }}>Unit</th>
                <th style={{ padding: '0.5rem' }}>Reference Range</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem', width: '35px' }}></th>
              </tr>
            </thead>
            <tbody>
              {resultRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                  <td style={{ padding: '0.35rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Glucose"
                      value={row.parameter}
                      onChange={(e) => handleResultRowChange(idx, 'parameter', e.target.value)}
                      required
                    />
                  </td>
                  <td style={{ padding: '0.35rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="95"
                      value={row.value}
                      onChange={(e) => handleResultRowChange(idx, 'value', e.target.value)}
                      required
                    />
                  </td>
                  <td style={{ padding: '0.35rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="mg/dL"
                      value={row.unit}
                      onChange={(e) => handleResultRowChange(idx, 'unit', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '0.35rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="70 - 100"
                      value={row.referenceRange}
                      onChange={(e) => handleResultRowChange(idx, 'referenceRange', e.target.value)}
                    />
                  </td>
                  <td style={{ padding: '0.35rem' }}>
                    <select
                      className="form-select"
                      value={row.status}
                      onChange={(e) => handleResultRowChange(idx, 'status', e.target.value)}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Low">Low</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.35rem' }}>
                    {resultRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveResultRow(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-500)', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleAddResultRow}
            style={{ marginBottom: '1rem' }}
          >
            <Plus size={14} /> Add Parameter
          </button>

          <FormGroup label="Pathologist / Laboratory Remarks">
            <textarea
              className="form-input"
              rows={2}
              placeholder="Clinical impression or observation..."
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsResultModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Finalizing...' : 'Save & Finalize Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW / PRINT REPORT MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Diagnostic Laboratory Report - ${activeTest?.testCode}`}
        maxWidth="750px"
      >
        {activeTest && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '2px solid var(--slate-200)' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-700)' }}>CAREPULSE PATHOLOGY LAB</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ISO 15189 Accredited Clinical Reference Laboratory
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                  {activeTest.testCode}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Date: {new Date(activeTest.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Patient & Doctor Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
              <div>
                <div><strong>Patient Name:</strong> {activeTest.patient?.firstName} {activeTest.patient?.lastName}</div>
                <div><strong>Patient ID:</strong> {activeTest.patient?.patientId}</div>
                <div><strong>Age / Gender:</strong> {activeTest.patient?.age}y / {activeTest.patient?.gender}</div>
              </div>
              <div>
                <div><strong>Prescribed By:</strong> Dr. {activeTest.doctor?.name}</div>
                <div><strong>Specimen:</strong> {activeTest.sampleType}</div>
                <div><strong>Turnaround:</strong> {activeTest.priority} Priority</div>
              </div>
            </div>

            <h4 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-main)' }}>
              {activeTest.testName} ({activeTest.category})
            </h4>

            {activeTest.results && activeTest.results.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--slate-100)', textAlign: 'left', fontSize: '0.8rem' }}>
                    <th style={{ padding: '0.5rem' }}>Test Parameter</th>
                    <th style={{ padding: '0.5rem' }}>Result Value</th>
                    <th style={{ padding: '0.5rem' }}>Unit</th>
                    <th style={{ padding: '0.5rem' }}>Reference Range</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTest.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--slate-100)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '0.5rem' }}><strong>{r.parameter}</strong></td>
                      <td style={{ padding: '0.5rem' }}>{r.value}</td>
                      <td style={{ padding: '0.5rem' }}>{r.unit}</td>
                      <td style={{ padding: '0.5rem' }}>{r.referenceRange}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span className={`badge ${r.status === 'Normal' ? 'badge-success' : 'badge-danger'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
                Awaiting sample processing. Diagnostic results have not yet been recorded for this investigation.
              </div>
            )}

            {activeTest.technicianNotes && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.85rem' }}>
                <strong>Remarks:</strong> {activeTest.technicianNotes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Report
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsViewModalOpen(false)}
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

export default LaboratoryPage;
