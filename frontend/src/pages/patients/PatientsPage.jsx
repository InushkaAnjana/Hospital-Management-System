import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, Filter, Eye, Edit3, Trash2,
  FileText, Shield, HeartPulse, AlertTriangle, Phone, Mail, MapPin, X
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';

export const PatientsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const initialForm = {
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'Unknown',
    phone: '',
    email: '',
    street: '',
    city: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRel: '',
    chronicConditions: '',
    allergies: '',
  };
  const [formData, setFormData] = useState(initialForm);

  // Document upload sub-modal state
  const [docForm, setDocForm] = useState({ title: '', documentType: 'Lab Report', fileUrl: '' });
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Fetch patients
  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientService.getPatients({
        search: searchTerm || undefined,
        bloodGroup: bloodGroupFilter || undefined,
      });
      setPatients(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch patients list');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, bloodGroupFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPatients]);

  // Open full patient profile
  const handleViewPatient = async (patient) => {
    try {
      const detail = await patientService.getPatientById(patient._id);
      setSelectedPatientDetail(detail);
      setIsViewOpen(true);
    } catch (err) {
      toast.error('Failed to load patient profile: ' + err.message);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (patient) => {
    setActivePatient(patient);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'Unknown',
      phone: patient.phone || '',
      email: patient.email || '',
      street: patient.address?.street || '',
      city: patient.address?.city || '',
      emergencyName: patient.emergencyContact?.name || '',
      emergencyPhone: patient.emergencyContact?.phone || '',
      emergencyRel: patient.emergencyContact?.relationship || '',
      chronicConditions: patient.medicalHistory?.chronicConditions?.join(', ') || '',
      allergies: patient.medicalHistory?.allergies?.join(', ') || '',
    });
    setIsEditOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: { street: formData.street, city: formData.city },
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRel,
        },
        medicalHistory: {
          chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()) : [],
          allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        },
      };

      const created = await patientService.createPatient(payload);
      toast.success(`Patient ${created.fullName} registered successfully! ID: ${created.patientId}`);
      setIsCreateOpen(false);
      setFormData(initialForm);
      loadPatients();
    } catch (err) {
      toast.error(err.message || 'Failed to register patient');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activePatient) return;
    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: { street: formData.street, city: formData.city },
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRel,
        },
        medicalHistory: {
          chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()) : [],
          allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        },
      };

      await patientService.updatePatient(activePatient._id, payload);
      toast.success(`Patient record updated.`);
      setIsEditOpen(false);
      loadPatients();
    } catch (err) {
      toast.error(err.message || 'Failed to update patient');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!selectedPatientDetail?.patient?._id) return;
    try {
      await patientService.addDocument(selectedPatientDetail.patient._id, docForm);
      toast.success('Medical document attached to patient.');
      setIsDocModalOpen(false);
      setDocForm({ title: '', documentType: 'Lab Report', fileUrl: '' });
      // Refresh detail
      const refreshed = await patientService.getPatientById(selectedPatientDetail.patient._id);
      setSelectedPatientDetail(refreshed);
    } catch (err) {
      toast.error('Failed to attach document: ' + err.message);
    }
  };

  // Delete Patient
  const handleDelete = async (patient) => {
    if (!window.confirm(`Are you sure you want to delete ${patient.fullName}?`)) return;
    try {
      await patientService.deletePatient(patient._id);
      toast.success(`Patient record removed.`);
      loadPatients();
    } catch (err) {
      toast.error(err.message || 'Failed to delete patient');
    }
  };

  const columns = [
    { key: 'patientId', label: 'Patient ID', width: '130px', render: (r) => <span className="badge badge-primary">{r.patientId}</span> },
    { key: 'name', label: 'Full Name', render: (r) => <div><strong>{r.fullName || `${r.firstName} ${r.lastName}`}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email || 'No email provided'}</div></div> },
    { key: 'gender', label: 'Gender', width: '90px' },
    { key: 'age', label: 'Age', width: '70px', render: (r) => `${r.age} yrs` },
    { key: 'phone', label: 'Contact Phone' },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      width: '110px',
      render: (r) => (
        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
          {r.bloodGroup}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '90px',
      render: (r) => <span className="badge badge-success">{r.status}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '130px',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            className="topbar-icon-btn"
            style={{ width: '30px', height: '30px' }}
            title="View Complete Medical Profile"
            onClick={() => handleViewPatient(row)}
          >
            <Eye size={15} />
          </button>
          {hasRole('Administrator', 'Doctor', 'Nurse', 'Receptionist') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '30px', height: '30px' }}
              title="Edit Patient"
              onClick={() => handleOpenEdit(row)}
            >
              <Edit3 size={15} />
            </button>
          )}
          {hasRole('Administrator') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '30px', height: '30px', color: 'var(--danger-600)' }}
              title="Delete Patient"
              onClick={() => handleDelete(row)}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Patient Management"
        subtitle="Live registry, clinical histories, emergency contacts, and document archives."
        icon={Users}
        breadcrumbs={[{ label: 'Patients' }]}
        badge="Active Database"
        actions={
          hasRole('Administrator', 'Doctor', 'Nurse', 'Receptionist') && (
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={15} /> Register Patient
            </button>
          )
        }
      />

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              placeholder="Search by name, ID, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      {loading ? (
        <LoadingSpinner message="Fetching patients from MongoDB..." />
      ) : (
        <DataTable
          columns={columns}
          data={patients}
          emptyTitle="No Patients Found"
          emptyMessage="No patient records match the search criteria. Click 'Register Patient' to create one."
        />
      )}

      {/* REGISTER PATIENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Patient"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <FormGrid>
            <FormGroup label="First Name" required>
              <Input
                required
                placeholder="e.g. Eleanor"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Last Name" required>
              <Input
                required
                placeholder="e.g. Vance"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Age" required>
              <Input
                type="number"
                required
                min="0"
                max="130"
                placeholder="e.g. 34"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Gender" required>
              <Select
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Blood Group">
              <Select
                options={[
                  { value: 'Unknown', label: 'Unknown' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                ]}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Phone Number" required>
              <Input
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Email Address">
              <Input
                type="email"
                placeholder="patient@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="City">
              <Input
                placeholder="e.g. New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Emergency Contact Name">
              <Input
                placeholder="e.g. Robert Vance"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Emergency Phone">
              <Input
                placeholder="+1 (555) 999-0000"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Known Allergies (Comma separated)">
              <Input
                placeholder="e.g. Penicillin, Aspirin"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Chronic Conditions (Comma separated)">
              <Input
                placeholder="e.g. Diabetes, Hypertension"
                value={formData.chronicConditions}
                onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PATIENT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Patient Information"
        maxWidth="680px"
      >
        <form onSubmit={handleEditSubmit}>
          <FormGrid>
            <FormGroup label="First Name" required>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Last Name" required>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Age" required>
              <Input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Gender" required>
              <Select
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Blood Group">
              <Select
                options={[
                  { value: 'Unknown', label: 'Unknown' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                ]}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Phone Number" required>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Email">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="City">
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Known Allergies">
              <Input
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Chronic Conditions">
              <Input
                value={formData.chronicConditions}
                onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PATIENT DETAIL DRAWER / MODAL */}
      {isViewOpen && selectedPatientDetail && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Clinical Dossier: ${selectedPatientDetail.patient.fullName} (${selectedPatientDetail.patient.patientId})`}
          maxWidth="840px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                backgroundColor: 'var(--slate-50)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age & Gender:</span>
                <div style={{ fontWeight: 600 }}>{selectedPatientDetail.patient.age} yrs • {selectedPatientDetail.patient.gender}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blood Group:</span>
                <div><span className="badge badge-primary">{selectedPatientDetail.patient.bloodGroup}</span></div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Contact:</span>
                <div style={{ fontWeight: 600 }}>{selectedPatientDetail.patient.phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Contact:</span>
                <div style={{ fontWeight: 600 }}>
                  {selectedPatientDetail.patient.emergencyContact?.name || 'N/A'} ({selectedPatientDetail.patient.emergencyContact?.phone || 'No phone'})
                </div>
              </div>
            </div>

            {/* Medical History Box */}
            <div className="card" style={{ padding: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartPulse size={16} color="var(--primary-600)" /> Medical History & Allergies
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger-600)' }}>Known Allergies:</span>
                  <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selectedPatientDetail.patient.medicalHistory?.allergies?.length > 0 ? (
                      selectedPatientDetail.patient.medicalHistory.allergies.map((a, i) => (
                        <span key={i} className="badge badge-danger">{a}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No known allergies</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-dark)' }}>Chronic Conditions:</span>
                  <div style={{ marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {selectedPatientDetail.patient.medicalHistory?.chronicConditions?.length > 0 ? (
                      selectedPatientDetail.patient.medicalHistory.chronicConditions.map((c, i) => (
                        <span key={i} className="badge badge-warning">{c}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None recorded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--primary-600)" /> Attached Patient Documents ({selectedPatientDetail.patient.documents?.length || 0})
                </h4>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => setIsDocModalOpen(true)}
                >
                  <Plus size={13} /> Attach Document
                </button>
              </div>

              {selectedPatientDetail.patient.documents?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedPatientDetail.patient.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--slate-50)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div>
                        <strong>{doc.title}</strong>{' '}
                        <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>{doc.documentType}</span>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        Open Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No documents attached yet.</p>
              )}
            </div>

            {/* Recent Appointments & EMR */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Recent Appointments ({selectedPatientDetail.appointments?.length || 0})
                </h4>
                {selectedPatientDetail.appointments?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPatientDetail.appointments.map((a, i) => (
                      <div key={i} style={{ fontSize: '0.8125rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                        <div><strong>{a.appointmentNumber}</strong> • <span className="badge badge-primary">{a.status}</span></div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(a.appointmentDate).toLocaleDateString()} | {a.doctor?.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No past appointments recorded.</p>
                )}
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Past Prescriptions ({selectedPatientDetail.prescriptions?.length || 0})
                </h4>
                {selectedPatientDetail.prescriptions?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPatientDetail.prescriptions.map((p, i) => (
                      <div key={i} style={{ fontSize: '0.8125rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                        <div><strong>{p.prescriptionNumber}</strong> • <span className="badge badge-success">{p.status}</span></div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.medicines?.length || 0} Meds • Dr. {p.doctor?.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No prescriptions recorded.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ATTACH DOCUMENT SUB-MODAL */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Attach Medical Document"
        maxWidth="500px"
      >
        <form onSubmit={handleAddDocument}>
          <FormGroup label="Document Title" required>
            <Input
              required
              placeholder="e.g. Chest X-Ray Scan"
              value={docForm.title}
              onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
            />
          </FormGroup>
          <FormGroup label="Document Category" required>
            <Select
              options={[
                { value: 'Lab Report', label: 'Lab Report' },
                { value: 'ID Proof', label: 'ID Proof' },
                { value: 'Discharge Summary', label: 'Discharge Summary' },
                { value: 'Prescription', label: 'Prescription' },
                { value: 'Insurance', label: 'Insurance' },
                { value: 'Other', label: 'Other' },
              ]}
              value={docForm.documentType}
              onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
            />
          </FormGroup>
          <FormGroup label="Document / File URL" required>
            <Input
              required
              placeholder="https://carepulse.hospital.org/docs/..."
              value={docForm.fileUrl}
              onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
            />
          </FormGroup>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsDocModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Attach to Profile</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
