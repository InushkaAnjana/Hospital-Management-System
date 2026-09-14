import React, { useState, useEffect, useCallback } from 'react';
import {
  Bed, Plus, Search, Eye, Edit3, Trash2,
  CheckCircle2, Clock, AlertCircle, UserMinus,
  Activity, Heart, Thermometer, UserPlus
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { admissionService } from '../../services/admissionService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

export const AdmissionsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Admitted');

  // Modals state
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeAdmission, setActiveAdmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalBeds: 80,
    occupiedBeds: 0,
    availableBeds: 80,
    occupancyRate: 0,
  });

  // Admit form
  const [admitForm, setAdmitForm] = useState({
    patient: '',
    doctor: '',
    ward: 'General Ward',
    roomNumber: 'Room 101',
    bedNumber: 'B-01',
    admissionReason: '',
    diagnosis: '',
    dailyRate: '150',
    nurseInCharge: 'Nurse Jackson',
  });

  // Discharge form
  const [dischargeForm, setDischargeForm] = useState({
    dischargeSummary: '',
    dischargeCondition: 'Stable',
  });

  // Vitals form
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '120/80',
    heartRate: '75',
    temperature: '98.6',
    respiratoryRate: '16',
    oxygenSaturation: '99',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [admissionsRes, patientsRes, doctorsRes, statsRes] = await Promise.all([
        admissionService.getAdmissions({
          status: statusFilter || undefined,
          ward: wardFilter || undefined,
          search: searchTerm || undefined,
        }),
        patientService.getPatients({ limit: 100 }),
        doctorService.getDoctors(),
        admissionService.getStats().catch(() => null),
      ]);

      setAdmissions(admissionsRes.data || []);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      toast.error(err.message || 'Failed to load inpatient admissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, wardFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenAdmit = () => {
    setAdmitForm({
      patient: patients[0]?._id || '',
      doctor: doctors[0]?._id || '',
      ward: 'General Ward',
      roomNumber: 'Room 201',
      bedNumber: `B-${Math.floor(Math.random() * 80 + 1)}`,
      admissionReason: 'Acute clinical observation',
      diagnosis: '',
      dailyRate: '150',
      nurseInCharge: 'Staff Nurse on Duty',
    });
    setIsAdmitOpen(true);
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    if (!admitForm.patient || !admitForm.doctor || !admitForm.ward || !admitForm.bedNumber) {
      toast.error('Please fill all required admission fields');
      return;
    }

    setSubmitting(true);
    try {
      await admissionService.createAdmission(admitForm);
      toast.success('Patient admitted to inpatient ward successfully');
      setIsAdmitOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to admit patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDischarge = (adm) => {
    setActiveAdmission(adm);
    setDischargeForm({
      dischargeSummary: 'Patient responded well to treatment and is discharged in stable condition.',
      dischargeCondition: 'Recovered',
    });
    setIsDischargeOpen(true);
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    if (!activeAdmission) return;

    setSubmitting(true);
    try {
      await admissionService.dischargePatient(activeAdmission._id, dischargeForm);
      toast.success(`Patient discharged from bed ${activeAdmission.bedNumber}`);
      setIsDischargeOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to discharge patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenVitals = (adm) => {
    setActiveAdmission(adm);
    setVitalsForm({
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.6',
      respiratoryRate: '16',
      oxygenSaturation: '99',
      notes: 'Patient resting comfortably.',
    });
    setIsVitalsOpen(true);
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    if (!activeAdmission) return;

    setSubmitting(true);
    try {
      await admissionService.addVitals(activeAdmission._id, vitalsForm);
      toast.success('Patient vital signs recorded');
      setIsVitalsOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (adm) => {
    setActiveAdmission(adm);
    setIsViewOpen(true);
  };

  const handleDelete = async (adm) => {
    if (!window.confirm(`Delete admission record ${adm.admissionNumber}?`)) return;
    try {
      await admissionService.deleteAdmission(adm._id);
      toast.success('Admission record deleted');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete admission');
    }
  };

  const columns = [
    {
      key: 'admissionNumber',
      label: 'Admission #',
      width: '130px',
      render: (r) => <strong style={{ color: 'var(--primary-600)' }}>{r.admissionNumber}</strong>,
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (r) => (
        <div>
          <strong>{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : 'Inpatient'}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.patient?.patientId} | {r.patient?.age}y | {r.patient?.bloodGroup}
          </div>
        </div>
      ),
    },
    {
      key: 'bed',
      label: 'Ward & Bed',
      render: (r) => (
        <div>
          <strong>{r.bedNumber}</strong> ({r.roomNumber})
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.ward}</div>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Attending Doctor',
      render: (r) => (r.doctor ? `Dr. ${r.doctor.name}` : 'Duty Physician'),
    },
    {
      key: 'admissionDate',
      label: 'Admitted Date',
      width: '120px',
      render: (r) => new Date(r.admissionDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (r) => {
        const variants = {
          Admitted: 'badge-primary',
          Discharged: 'badge-success',
          Transferred: 'badge-warning',
        };
        return <span className={`badge ${variants[r.status] || 'badge-neutral'}`}>{r.status}</span>;
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
            title="View Details & Chart"
            onClick={() => handleOpenView(r)}
          >
            <Eye size={14} />
          </button>
          {r.status === 'Admitted' && (
            <>
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px', color: 'var(--primary-600)' }}
                title="Record Clinical Vitals"
                onClick={() => handleOpenVitals(r)}
              >
                <Activity size={14} />
              </button>
              {hasRole('Administrator', 'Doctor') && (
                <button
                  className="topbar-icon-btn"
                  style={{ width: '28px', height: '28px', color: 'var(--warning-600)' }}
                  title="Discharge Inpatient"
                  onClick={() => handleOpenDischarge(r)}
                >
                  <UserMinus size={14} />
                </button>
              )}
            </>
          )}
          {hasRole('Administrator') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '28px', height: '28px', color: 'var(--danger-600)' }}
              title="Delete Record"
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
        title="Inpatient Admissions & Ward Management (IPD)"
        subtitle="Hospital ward occupancy, bed assignments, nurse vitals monitoring, and discharge summaries."
        icon={Bed}
        breadcrumbs={[{ label: 'Admissions' }]}
        badge="Live Wards"
        actions={
          hasRole('Administrator', 'Doctor', 'Nurse') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdmit}>
              <Plus size={15} /> Admit Patient
            </button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Bed size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.totalBeds} Beds</div>
            <div className="metric-label">Total Bed Capacity</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.occupiedBeds} Beds</div>
            <div className="metric-label">Occupied Inpatients</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.availableBeds} Beds</div>
            <div className="metric-label">Available Vacant Beds</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.occupancyRate}%</div>
            <div className="metric-label">Current Occupancy Rate</div>
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
              placeholder="Search by admission #, room, or bed number..."
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
              <option value="Admitted">Currently Admitted</option>
              <option value="Discharged">Discharged History</option>
            </select>
          </div>

          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
            >
              <option value="">All Wards</option>
              <option value="General Ward">General Ward</option>
              <option value="Semi-Private Ward">Semi-Private Ward</option>
              <option value="Private Suite">Private Suite</option>
              <option value="ICU (Intensive Care)">ICU</option>
              <option value="CCU (Cardiac Care)">CCU</option>
              <option value="Emergency Ward">Emergency Ward</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading inpatient records..." />
      ) : (
        <DataTable
          columns={columns}
          data={admissions}
          emptyTitle="No Inpatients Found"
          emptyMessage="No admissions match the criteria. Click 'Admit Patient' to register a hospital inpatient."
        />
      )}

      {/* ADMIT PATIENT MODAL */}
      <Modal
        isOpen={isAdmitOpen}
        onClose={() => setIsAdmitOpen(false)}
        title="Admit Inpatient to Ward"
        maxWidth="680px"
      >
        <form onSubmit={handleAdmitSubmit}>
          <FormGrid>
            <FormGroup label="Select Patient" required>
              <Select
                required
                options={patients.map((p) => ({
                  value: p._id,
                  label: `${p.firstName} ${p.lastName} (${p.patientId})`,
                }))}
                value={admitForm.patient}
                onChange={(e) => setAdmitForm({ ...admitForm, patient: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Admitting Physician" required>
              <Select
                required
                options={doctors.map((d) => ({
                  value: d._id,
                  label: `Dr. ${d.name} (${d.specialization})`,
                }))}
                value={admitForm.doctor}
                onChange={(e) => setAdmitForm({ ...admitForm, doctor: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Ward / Medical Unit" required>
              <Select
                required
                options={[
                  { value: 'General Ward', label: 'General Ward' },
                  { value: 'Semi-Private Ward', label: 'Semi-Private Ward' },
                  { value: 'Private Suite', label: 'Private Suite' },
                  { value: 'ICU (Intensive Care)', label: 'ICU - Intensive Care Unit' },
                  { value: 'CCU (Cardiac Care)', label: 'CCU - Coronary Care Unit' },
                  { value: 'Emergency Ward', label: 'Emergency Ward' },
                  { value: 'Pediatric Ward', label: 'Pediatric Ward' },
                  { value: 'Maternity Ward', label: 'Maternity Ward' },
                ]}
                value={admitForm.ward}
                onChange={(e) => setAdmitForm({ ...admitForm, ward: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Room Number" required>
              <Input
                required
                placeholder="e.g. Room 204"
                value={admitForm.roomNumber}
                onChange={(e) => setAdmitForm({ ...admitForm, roomNumber: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Bed Number" required>
              <Input
                required
                placeholder="e.g. B-12"
                value={admitForm.bedNumber}
                onChange={(e) => setAdmitForm({ ...admitForm, bedNumber: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Daily Bed Rate ($)">
              <Input
                type="number"
                min="0"
                value={admitForm.dailyRate}
                onChange={(e) => setAdmitForm({ ...admitForm, dailyRate: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Nurse In Charge">
              <Input
                placeholder="Duty Nurse Name"
                value={admitForm.nurseInCharge}
                onChange={(e) => setAdmitForm({ ...admitForm, nurseInCharge: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Provisional Diagnosis">
              <Input
                placeholder="e.g. Acute Appendicitis"
                value={admitForm.diagnosis}
                onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup label="Reason for Inpatient Admission" required style={{ marginTop: '0.75rem' }}>
            <textarea
              className="form-input"
              rows={2}
              required
              placeholder="Clinical indications for admission..."
              value={admitForm.admissionReason}
              onChange={(e) => setAdmitForm({ ...admitForm, admissionReason: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsAdmitOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Admitting...' : 'Admit Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DISCHARGE MODAL */}
      <Modal
        isOpen={isDischargeOpen}
        onClose={() => setIsDischargeOpen(false)}
        title={`Discharge Patient - ${activeAdmission?.admissionNumber}`}
        maxWidth="540px"
      >
        <form onSubmit={handleDischargeSubmit}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
            <div>Patient: <strong>{activeAdmission?.patient?.firstName} {activeAdmission?.patient?.lastName}</strong></div>
            <div>Ward: {activeAdmission?.ward} | Bed: {activeAdmission?.bedNumber}</div>
            <div>Admitted On: {activeAdmission && new Date(activeAdmission.admissionDate).toLocaleDateString()}</div>
          </div>

          <FormGroup label="Condition on Discharge" required>
            <Select
              required
              options={[
                { value: 'Recovered', label: 'Recovered / Cured' },
                { value: 'Stable', label: 'Stable (Outpatient Follow-up)' },
                { value: 'Referred', label: 'Referred to Specialty Center' },
                { value: 'Against Medical Advice', label: 'Discharged Against Medical Advice (DAMA)' },
              ]}
              value={dischargeForm.dischargeCondition}
              onChange={(e) => setDischargeForm({ ...dischargeForm, dischargeCondition: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Discharge Clinical Summary / Instructions" required>
            <textarea
              className="form-input"
              rows={3}
              required
              placeholder="Clinical summary, follow-up medication instructions..."
              value={dischargeForm.dischargeSummary}
              onChange={(e) => setDischargeForm({ ...dischargeForm, dischargeSummary: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsDischargeOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Discharging...' : 'Confirm Discharge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD VITALS MODAL */}
      <Modal
        isOpen={isVitalsOpen}
        onClose={() => setIsVitalsOpen(false)}
        title={`Record Inpatient Vitals - Bed ${activeAdmission?.bedNumber}`}
        maxWidth="480px"
      >
        <form onSubmit={handleVitalsSubmit}>
          <FormGrid>
            <FormGroup label="Blood Pressure (mmHg)" required>
              <Input
                placeholder="120/80"
                value={vitalsForm.bloodPressure}
                onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Heart Rate (bpm)">
              <Input
                type="number"
                placeholder="75"
                value={vitalsForm.heartRate}
                onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Body Temp (°F)">
              <Input
                type="number"
                step="0.1"
                placeholder="98.6"
                value={vitalsForm.temperature}
                onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Oxygen SpO2 (%)">
              <Input
                type="number"
                placeholder="99"
                value={vitalsForm.oxygenSaturation}
                onChange={(e) => setVitalsForm({ ...vitalsForm, oxygenSaturation: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup label="Nurse Observations / Notes" style={{ marginTop: '0.75rem' }}>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Patient condition observations..."
              value={vitalsForm.notes}
              onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsVitalsOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : 'Record Vitals'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW INPATIENT CHART MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Inpatient Medical Chart - ${activeAdmission?.admissionNumber}`}
        maxWidth="650px"
      >
        {activeAdmission && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
              <div>
                <strong>Patient:</strong> {activeAdmission.patient?.firstName} {activeAdmission.patient?.lastName}
                <div>ID: {activeAdmission.patient?.patientId}</div>
                <div>Emergency Contact: {activeAdmission.patient?.emergencyContact?.phone || 'N/A'}</div>
              </div>
              <div>
                <strong>Location:</strong> {activeAdmission.ward}
                <div>Room: {activeAdmission.roomNumber} | Bed: {activeAdmission.bedNumber}</div>
                <div>Doctor: Dr. {activeAdmission.doctor?.name}</div>
              </div>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <strong>Admission Diagnosis / Reason:</strong>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
                {activeAdmission.diagnosis || activeAdmission.admissionReason}
              </p>
            </div>

            {activeAdmission.vitalsLog && activeAdmission.vitalsLog.length > 0 && (
              <div>
                <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Vitals Observation Log</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--slate-100)', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem' }}>Time</th>
                      <th style={{ padding: '0.4rem' }}>BP</th>
                      <th style={{ padding: '0.4rem' }}>HR</th>
                      <th style={{ padding: '0.4rem' }}>Temp</th>
                      <th style={{ padding: '0.4rem' }}>SpO2</th>
                      <th style={{ padding: '0.4rem' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAdmission.vitalsLog.map((v, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                        <td style={{ padding: '0.4rem' }}>{new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '0.4rem' }}>{v.bloodPressure || '-'}</td>
                        <td style={{ padding: '0.4rem' }}>{v.heartRate ? `${v.heartRate} bpm` : '-'}</td>
                        <td style={{ padding: '0.4rem' }}>{v.temperature ? `${v.temperature} °F` : '-'}</td>
                        <td style={{ padding: '0.4rem' }}>{v.oxygenSaturation ? `${v.oxygenSaturation}%` : '-'}</td>
                        <td style={{ padding: '0.4rem' }}>{v.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeAdmission.status === 'Discharged' && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                <strong>Discharge Summary ({activeAdmission.dischargeCondition}):</strong>
                <p style={{ margin: '0.25rem 0' }}>{activeAdmission.dischargeSummary}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setIsViewOpen(false)}>
                Close Chart
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionsPage;
