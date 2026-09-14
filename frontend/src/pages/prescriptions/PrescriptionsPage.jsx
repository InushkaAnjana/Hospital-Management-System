import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill, Plus, Search, Eye, CheckCircle, XCircle,
  Clock, Trash2, Printer, CheckCheck, AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, Textarea, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { prescriptionService } from '../../services/prescriptionService';
import { medicineService } from '../../services/medicineService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';

export const PrescriptionsPage = () => {
  const toast = useToast();
  const { user, hasRole } = useAuth();

  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    diagnosis: '',
    notes: '',
  });

  // Dynamic Medicine Lines
  const defaultMedLine = {
    medicine: '',
    medicineName: '',
    genericName: '',
    dosage: '1 Tablet',
    frequency: 'Twice daily (BID)',
    duration: '7 Days',
    quantity: 14,
    instructions: 'Take after meals',
  };
  const [medicineLines, setMedicineLines] = useState([defaultMedLine]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rxRes, meds, docs, patsRes] = await Promise.all([
        prescriptionService.getPrescriptions({ status: statusFilter || undefined }),
        medicineService.getMedicines(),
        doctorService.getDoctors(),
        patientService.getPatients({ limit: 100 }),
      ]);
      setPrescriptions(rxRes.data || []);
      setMedicines(meds || []);
      setDoctors(docs || []);
      setPatients(patsRes.data || []);

      if (docs.length > 0 && !formData.doctor) {
        setFormData((prev) => ({ ...prev, doctor: docs[0]._id }));
      }
      if (patsRes.data?.length > 0 && !formData.patient) {
        setFormData((prev) => ({ ...prev, patient: patsRes.data[0]._id }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Medicine Line Change
  const handleMedLineChange = (index, field, value) => {
    setMedicineLines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // Auto-fill names if medicine item selected
      if (field === 'medicine') {
        const found = medicines.find((m) => m._id === value);
        if (found) {
          copy[index].medicineName = found.name;
          copy[index].genericName = found.genericName;
        }
      }
      return copy;
    });
  };

  const addMedLine = () => {
    setMedicineLines([...medicineLines, defaultMedLine]);
  };

  const removeMedLine = (index) => {
    if (medicineLines.length <= 1) return;
    setMedicineLines(medicineLines.filter((_, i) => i !== index));
  };

  // Submit Prescription
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        medicines: medicineLines,
      };

      const created = await prescriptionService.createPrescription(payload);
      toast.success(`Prescription ${created.prescriptionNumber} generated successfully!`);
      setIsCreateOpen(false);
      setMedicineLines([defaultMedLine]);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to issue prescription');
    } finally {
      setSubmitting(false);
    }
  };

  // Dispense Prescription
  const handleDispense = async (rx) => {
    try {
      await prescriptionService.dispensePrescription(rx._id);
      toast.success(`Prescription ${rx.prescriptionNumber} dispensed! Pharmacy stock deducted.`);
      loadData();
      if (selectedRx?._id === rx._id) {
        setIsViewOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to dispense prescription');
    }
  };

  // Cancel Prescription
  const handleCancel = async (rx) => {
    if (!window.confirm(`Cancel prescription ${rx.prescriptionNumber}?`)) return;
    try {
      await prescriptionService.cancelPrescription(rx._id);
      toast.success('Prescription marked as cancelled.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel prescription');
    }
  };

  const handleOpenView = async (rx) => {
    try {
      const detail = await prescriptionService.getPrescriptionById(rx._id);
      setSelectedRx(detail);
      setIsViewOpen(true);
    } catch (err) {
      toast.error('Failed to load prescription: ' + err.message);
    }
  };

  const columns = [
    { key: 'rxNo', label: 'Rx #', width: '130px', render: (r) => <span className="badge badge-primary">{r.prescriptionNumber}</span> },
    {
      key: 'patient',
      label: 'Patient',
      render: (r) => (
        <div>
          <strong>{r.patient?.firstName} {r.patient?.lastName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.patient?.patientId}</div>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Prescribing Doctor',
      render: (r) => (
        <div>
          <strong>{r.doctor?.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>{r.doctor?.specialization}</div>
        </div>
      ),
    },
    {
      key: 'meds',
      label: 'Prescribed Drugs',
      render: (r) => (
        <div>
          <span className="badge badge-neutral">{r.medicines?.length || 0} Medications</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {r.medicines?.slice(0, 2).map((m) => m.medicineName).join(', ')}
            {r.medicines?.length > 2 ? '...' : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (r) => {
        const variants = {
          Active: 'badge-primary',
          Dispensed: 'badge-success',
          Cancelled: 'badge-danger',
        };
        return <span className={`badge ${variants[r.status] || 'badge-neutral'}`}>{r.status}</span>;
      },
    },
    {
      key: 'date',
      label: 'Date Issued',
      width: '120px',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            className="topbar-icon-btn"
            style={{ width: '30px', height: '30px' }}
            title="View & Print Rx"
            onClick={() => handleOpenView(r)}
          >
            <Eye size={14} />
          </button>
          {r.status === 'Active' && hasRole('Administrator', 'Pharmacist') && (
            <button
              className="btn btn-primary btn-sm"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Dispense from Pharmacy"
              onClick={() => handleDispense(r)}
            >
              Dispense
            </button>
          )}
          {r.status === 'Active' && hasRole('Administrator', 'Doctor') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '30px', height: '30px', color: 'var(--danger-600)' }}
              title="Cancel Prescription"
              onClick={() => handleCancel(r)}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Prescription Management & Dispensing"
        subtitle="Digital clinical prescriptions, inventory connection, and pharmaceutical dispensing."
        icon={Pill}
        breadcrumbs={[{ label: 'Prescriptions' }]}
        badge="Inventory Connected"
        actions={
          hasRole('Administrator', 'Doctor') && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={15} /> Issue Prescription
            </button>
          )
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['', 'Active', 'Dispensed', 'Cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setStatusFilter(st)}
          >
            {st || 'All Prescriptions'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching prescriptions..." />
      ) : (
        <DataTable
          columns={columns}
          data={prescriptions}
          emptyTitle="No Prescriptions Recorded"
          emptyMessage="No prescriptions matching criteria. Click 'Issue Prescription' to prescribe medications."
        />
      )}

      {/* ISSUE PRESCRIPTION MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Clinical Prescription"
        maxWidth="820px"
      >
        <form onSubmit={handleCreateSubmit}>
          <FormGrid>
            <FormGroup label="Select Patient" required>
              <Select
                required
                options={patients.map((p) => ({
                  value: p._id,
                  label: `${p.fullName || `${p.firstName} ${p.lastName}`} (${p.patientId})`,
                }))}
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Prescribing Doctor" required>
              <Select
                required
                options={doctors.map((d) => ({
                  value: d._id,
                  label: `${d.name} (${d.specialization})`,
                }))}
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <div style={{ margin: '0.75rem 0' }}>
            <FormGroup label="Indication / Diagnosis">
              <Input
                placeholder="e.g. Type 2 Diabetes Mellitus / Upper Respiratory Tract Infection"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </FormGroup>
          </div>

          {/* DYNAMIC PRESCRIBED MEDICINES BUILDER */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Prescribed Medicines ({medicineLines.length})
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={addMedLine}
              >
                <Plus size={13} /> Add Another Drug
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {medicineLines.map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <FormGroup label="Select Medicine from Pharmacy" required>
                      <Select
                        required
                        options={medicines.map((m) => ({
                          value: m._id,
                          label: `${m.name} (${m.strength}) [Stock: ${m.stockQuantity}]`,
                        }))}
                        value={line.medicine}
                        onChange={(e) => handleMedLineChange(idx, 'medicine', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup label="Dosage" required>
                      <Input
                        required
                        placeholder="e.g. 1 Tablet"
                        value={line.dosage}
                        onChange={(e) => handleMedLineChange(idx, 'dosage', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup label="Frequency" required>
                      <Input
                        required
                        placeholder="e.g. Twice daily"
                        value={line.frequency}
                        onChange={(e) => handleMedLineChange(idx, 'frequency', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup label="Duration" required>
                      <Input
                        required
                        placeholder="e.g. 7 Days"
                        value={line.duration}
                        onChange={(e) => handleMedLineChange(idx, 'duration', e.target.value)}
                      />
                    </FormGroup>

                    {medicineLines.length > 1 && (
                      <button
                        type="button"
                        className="topbar-icon-btn"
                        style={{ color: 'var(--danger-600)', height: '36px', width: '36px' }}
                        title="Remove Drug"
                        onClick={() => removeMedLine(idx)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                    <FormGroup label="Quantity">
                      <Input
                        type="number"
                        min="1"
                        placeholder="14"
                        value={line.quantity}
                        onChange={(e) => handleMedLineChange(idx, 'quantity', e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup label="Instructions / Food Guidelines">
                      <Input
                        placeholder="Take with water immediately after breakfast and dinner"
                        value={line.instructions}
                        onChange={(e) => handleMedLineChange(idx, 'instructions', e.target.value)}
                      />
                    </FormGroup>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <FormGroup label="Physician Notes & Refill Instructions">
              <Textarea
                rows={2}
                placeholder="Next review in 14 days, contact clinic if rash appears..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </FormGroup>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Generating Rx...' : 'Sign & Issue Prescription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW PRINTABLE PRESCRIPTION MODAL */}
      {isViewOpen && selectedRx && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Hospital Prescription Slip (${selectedRx.prescriptionNumber})`}
          maxWidth="680px"
        >
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: 'white',
              border: '2px solid var(--slate-200)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Prescription Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-600)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-700)', fontSize: '1.25rem', fontWeight: 800 }}>
                  CarePulse General Hospital
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Outpatient Pharmacy & Clinical Consultation
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{selectedRx.prescriptionNumber}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Date: {new Date(selectedRx.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Doctor & Patient Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                <div style={{ fontWeight: 700 }}>{selectedRx.patient?.firstName} {selectedRx.patient?.lastName}</div>
                <div style={{ color: 'var(--text-muted)' }}>ID: {selectedRx.patient?.patientId} | Age: {selectedRx.patient?.age}y ({selectedRx.patient?.gender})</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Prescribing Consultant:</span>
                <div style={{ fontWeight: 700 }}>{selectedRx.doctor?.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>{selectedRx.doctor?.specialization}</div>
              </div>
            </div>

            {selectedRx.diagnosis && (
              <div style={{ padding: '0.5rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                <strong>Diagnosis:</strong> {selectedRx.diagnosis}
              </div>
            )}

            {/* Prescribed Items (Rx Table) */}
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)', marginBottom: '0.5rem', fontFamily: 'serif' }}>
                ℞
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0' }}>#</th>
                    <th>Medication</th>
                    <th>Dosage & Frequency</th>
                    <th>Duration</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>{idx + 1}.</td>
                      <td>
                        <strong>{item.medicineName}</strong>
                        {item.instructions && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.instructions}</div>
                        )}
                      </td>
                      <td>{item.dosage} • {item.frequency}</td>
                      <td>{item.duration}</td>
                      <td><strong>{item.quantity}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRx.notes && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Instructions:</strong> {selectedRx.notes}
              </div>
            )}

            {/* Status & Dispense Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div>
                <span className={`badge ${selectedRx.status === 'Dispensed' ? 'badge-success' : selectedRx.status === 'Active' ? 'badge-primary' : 'badge-danger'}`}>
                  {selectedRx.status}
                </span>
                {selectedRx.dispensedAt && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    Dispensed on {new Date(selectedRx.dispensedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print Rx
                </button>

                {selectedRx.status === 'Active' && hasRole('Administrator', 'Pharmacist') && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDispense(selectedRx)}
                  >
                    <CheckCheck size={14} /> Dispense & Deduct Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
