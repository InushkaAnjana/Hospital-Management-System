import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Search, Eye, Activity, Heart,
  Thermometer, Wind, Weight, PlusCircle, Paperclip
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, Textarea, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { medicalRecordService } from '../../services/medicalRecordService';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';

export const MedicalRecordsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const initialForm = {
    patient: '',
    doctor: '',
    diagnosis: '',
    symptoms: '',
    clinicalNotes: '',
    treatmentPlan: '',
    bp: '120/80 mmHg',
    pulse: '72',
    temp: '98.6',
    resp: '16',
    weight: '70',
    spo2: '98',
  };
  const [formData, setFormData] = useState(initialForm);

  // Attach Report Form State
  const [reportForm, setReportForm] = useState({
    title: '',
    reportType: 'Lab Test',
    fileUrl: '',
    summary: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [emrRes, docs, patsRes] = await Promise.all([
        medicalRecordService.getMedicalRecords({ search: searchTerm || undefined }),
        doctorService.getDoctors(),
        patientService.getPatients({ limit: 100 }),
      ]);
      setRecords(emrRes.data || []);
      setDoctors(docs || []);
      setPatients(patsRes.data || []);

      if (docs.length > 0 && !formData.doctor) {
        setFormData((prev) => ({ ...prev, doctor: docs[0]._id }));
      }
      if (patsRes.data?.length > 0 && !formData.patient) {
        setFormData((prev) => ({ ...prev, patient: patsRes.data[0]._id }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Create EMR Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map((s) => s.trim()) : [],
        clinicalNotes: formData.clinicalNotes,
        treatmentHistory: [
          {
            date: new Date(),
            treatment: formData.treatmentPlan || `Initial clinical plan for ${formData.diagnosis}`,
            doctorNotes: formData.clinicalNotes,
          },
        ],
        vitalSigns: {
          bloodPressure: formData.bp,
          pulseRate: Number(formData.pulse) || undefined,
          temperature: Number(formData.temp) || undefined,
          respiratoryRate: Number(formData.resp) || undefined,
          weight: Number(formData.weight) || undefined,
          oxygenSaturation: Number(formData.spo2) || undefined,
        },
      };

      const created = await medicalRecordService.createMedicalRecord(payload);
      toast.success(`EMR record ${created.recordId} created successfully!`);
      setIsCreateOpen(false);
      setFormData(initialForm);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create medical record');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Attach Diagnostic Report
  const handleAttachReport = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await medicalRecordService.addReport(selectedRecord._id, reportForm);
      toast.success('Diagnostic report attached to clinical record.');
      setIsReportModalOpen(false);
      setReportForm({ title: '', reportType: 'Lab Test', fileUrl: '', summary: '' });
      // Refresh single record
      const refreshed = await medicalRecordService.getMedicalRecordById(selectedRecord._id);
      setSelectedRecord(refreshed);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to attach report');
    }
  };

  const handleOpenView = async (rec) => {
    try {
      const detail = await medicalRecordService.getMedicalRecordById(rec._id);
      setSelectedRecord(detail);
      setIsViewOpen(true);
    } catch (err) {
      toast.error('Failed to load record: ' + err.message);
    }
  };

  const columns = [
    { key: 'recordId', label: 'Record ID', width: '130px', render: (r) => <span className="badge badge-primary">{r.recordId}</span> },
    {
      key: 'patient',
      label: 'Patient Name',
      render: (r) => (
        <div>
          <strong>{r.patient?.firstName} {r.patient?.lastName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.patient?.patientId} • {r.patient?.age}y ({r.patient?.gender})</div>
        </div>
      ),
    },
    {
      key: 'doctor',
      label: 'Attending Doctor',
      render: (r) => (
        <div>
          <strong>{r.doctor?.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>{r.doctor?.specialization}</div>
        </div>
      ),
    },
    {
      key: 'diagnosis',
      label: 'Clinical Diagnosis',
      render: (r) => (
        <div>
          <strong>{r.diagnosis}</strong>
          {r.symptoms?.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.symptoms.join(', ')}</div>
          )}
        </div>
      ),
    },
    {
      key: 'vitals',
      label: 'Vitals (BP / HR / SpO2)',
      render: (r) => {
        const v = r.vitalSigns || {};
        return (
          <div style={{ fontSize: '0.8125rem' }}>
            {v.bloodPressure || 'N/A'} • {v.pulseRate ? `${v.pulseRate} bpm` : ''} • {v.oxygenSaturation ? `${v.oxygenSaturation}%` : ''}
          </div>
        );
      },
    },
    {
      key: 'date',
      label: 'Encounter Date',
      width: '120px',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '90px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="topbar-icon-btn"
            style={{ width: '30px', height: '30px' }}
            title="View Full Clinical Dossier"
            onClick={() => handleOpenView(r)}
          >
            <Eye size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Electronic Medical Records (EMR)"
        subtitle="Clinical consultations, vital sign telemetry, diagnostic impressions, and treatment logs."
        icon={FileText}
        breadcrumbs={[{ label: 'Medical Records' }]}
        badge="HIPAA Compliant"
        actions={
          hasRole('Administrator', 'Doctor') && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={15} /> Record Clinical Encounter
            </button>
          )
        }
      />

      {/* Search toolbar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
            placeholder="Search diagnosis, record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching medical records..." />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          emptyTitle="No Medical Records"
          emptyMessage="No clinical encounters matching criteria. Click 'Record Clinical Encounter' to begin."
        />
      )}

      {/* CREATE EMR MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Clinical Encounter (EMR)"
        maxWidth="740px"
      >
        <form onSubmit={handleCreateSubmit}>
          <FormGrid>
            <FormGroup label="Patient" required>
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

            <FormGroup label="Attending Doctor" required>
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

          <div style={{ marginTop: '0.75rem' }}>
            <FormGroup label="Primary Clinical Diagnosis" required>
              <Input
                required
                placeholder="e.g. Acute Bronchitis with Mild Hypoxemia"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Presenting Symptoms (Comma separated)">
              <Input
                placeholder="e.g. Coughing, shortness of breath, fever for 3 days"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              />
            </FormGroup>
          </div>

          {/* Vitals Telemetry Grid */}
          <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>
              Patient Vital Signs Telemetry
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <FormGroup label="Blood Pressure">
                <Input
                  placeholder="120/80"
                  value={formData.bp}
                  onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                />
              </FormGroup>
              <FormGroup label="Heart Rate (bpm)">
                <Input
                  type="number"
                  placeholder="72"
                  value={formData.pulse}
                  onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                />
              </FormGroup>
              <FormGroup label="Temperature (°F)">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={formData.temp}
                  onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                />
              </FormGroup>
              <FormGroup label="Resp Rate (/min)">
                <Input
                  type="number"
                  placeholder="16"
                  value={formData.resp}
                  onChange={(e) => setFormData({ ...formData, resp: e.target.value })}
                />
              </FormGroup>
              <FormGroup label="Weight (kg)">
                <Input
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </FormGroup>
              <FormGroup label="SpO2 (%)">
                <Input
                  type="number"
                  placeholder="98"
                  value={formData.spo2}
                  onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                />
              </FormGroup>
            </div>
          </div>

          <FormGroup label="Clinical Examination & Observations">
            <Textarea
              rows={3}
              placeholder="Auscultation findings, abdominal examination, neurological response..."
              value={formData.clinicalNotes}
              onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Treatment Plan & Therapeutic Interventions">
            <Textarea
              rows={2}
              placeholder="Prescribed rest, medication instructions, scheduled laboratory re-test..."
              value={formData.treatmentPlan}
              onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Archiving Encounter...' : 'Save EMR Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW EMR DOSSIER MODAL */}
      {isViewOpen && selectedRecord && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Clinical Encounter: ${selectedRecord.recordId}`}
          maxWidth="780px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>Patient:</span>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {selectedRecord.patient?.firstName} {selectedRecord.patient?.lastName} ({selectedRecord.patient?.patientId})
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {selectedRecord.patient?.age} yrs • {selectedRecord.patient?.gender} • Blood: {selectedRecord.patient?.bloodGroup}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>Attending Doctor:</span>
                <div style={{ fontWeight: 700 }}>{selectedRecord.doctor?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedRecord.doctor?.specialization}</div>
              </div>
            </div>

            {/* Diagnosis Banner */}
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-600)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-700)', fontWeight: 700 }}>
                Primary Clinical Diagnosis
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {selectedRecord.diagnosis}
              </div>
              {selectedRecord.symptoms?.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Symptoms:</span>
                  {selectedRecord.symptoms.map((s, idx) => (
                    <span key={idx} className="badge badge-neutral">{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Vitals Cards */}
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Recorded Vital Signs:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                <div className="card" style={{ padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Blood Pressure</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{selectedRecord.vitalSigns?.bloodPressure || 'N/A'}</div>
                </div>
                <div className="card" style={{ padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pulse Rate</div>
                  <div style={{ fontWeight: 700 }}>{selectedRecord.vitalSigns?.pulseRate ? `${selectedRecord.vitalSigns.pulseRate} bpm` : 'N/A'}</div>
                </div>
                <div className="card" style={{ padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Temperature</div>
                  <div style={{ fontWeight: 700 }}>{selectedRecord.vitalSigns?.temperature ? `${selectedRecord.vitalSigns.temperature}°F` : 'N/A'}</div>
                </div>
                <div className="card" style={{ padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Respiratory</div>
                  <div style={{ fontWeight: 700 }}>{selectedRecord.vitalSigns?.respiratoryRate ? `${selectedRecord.vitalSigns.respiratoryRate}/min` : 'N/A'}</div>
                </div>
                <div className="card" style={{ padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Oxygen SpO2</div>
                  <div style={{ fontWeight: 700, color: 'var(--success-600)' }}>{selectedRecord.vitalSigns?.oxygenSaturation ? `${selectedRecord.vitalSigns.oxygenSaturation}%` : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Clinical Examination Notes */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>Examination Notes:</div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                {selectedRecord.clinicalNotes || 'No notes entered.'}
              </p>
            </div>

            {/* Treatment History Timeline */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Treatment & Care Timeline:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedRecord.treatmentHistory?.map((t, idx) => (
                  <div key={idx} style={{ padding: '0.5rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600 }}>{t.treatment}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()} {t.doctorNotes ? `• ${t.doctorNotes}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Diagnostic Reports */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Attached Diagnostic Reports ({selectedRecord.reports?.length || 0})</div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => setIsReportModalOpen(true)}
                >
                  <PlusCircle size={13} /> Attach Report
                </button>
              </div>

              {selectedRecord.reports?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRecord.reports.map((rep, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
                      <div>
                        <strong>{rep.title}</strong> <span className="badge badge-neutral">{rep.reportType}</span>
                        {rep.summary && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rep.summary}</div>}
                      </div>
                      <a href={rep.fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        View Report
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No diagnostic reports attached yet.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ATTACH REPORT SUB-MODAL */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Attach Diagnostic / Lab Report"
        maxWidth="500px"
      >
        <form onSubmit={handleAttachReport}>
          <FormGroup label="Report Title" required>
            <Input
              required
              placeholder="e.g. 12-Lead ECG Tracing"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Report Category" required>
            <Select
              options={[
                { value: 'Lab Test', label: 'Lab Test' },
                { value: 'Radiology / X-Ray', label: 'Radiology / X-Ray' },
                { value: 'ECG / Echo', label: 'ECG / Echo' },
                { value: 'Biopsy', label: 'Biopsy' },
                { value: 'Other', label: 'Other' },
              ]}
              value={reportForm.reportType}
              onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Report File URL" required>
            <Input
              required
              placeholder="https://carepulse.hospital.org/reports/..."
              value={reportForm.fileUrl}
              onChange={(e) => setReportForm({ ...reportForm, fileUrl: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Clinical Impression / Summary">
            <Input
              placeholder="e.g. Normal sinus rhythm, no acute ischemic abnormalities"
              value={reportForm.summary}
              onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsReportModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Attach Report</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
