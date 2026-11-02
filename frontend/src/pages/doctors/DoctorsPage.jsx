import React, { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope, Plus, Search, Edit3, Trash2, Calendar, Clock,
  DollarSign, LayoutGrid, List, Phone, Mail, Award, CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { getDoctorAvatar } from '../../utils/imageAssets';

export const DoctorsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDoctorId, setActiveDoctorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    specialization: '',
    department: '',
    qualifications: 'MBBS, MD',
    experienceYears: '5',
    consultationFee: '100',
    phone: '',
    email: '',
    status: 'Available',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  };
  const [formData, setFormData] = useState(initialForm);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [docs, depts] = await Promise.all([
        doctorService.getDoctors({
          search: searchTerm || undefined,
          department: selectedDept || undefined,
        }),
        departmentService.getDepartments(),
      ]);
      setDoctors(docs || []);
      setDepartments(depts || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch doctor roster');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDept, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setActiveDoctorId(null);
    setFormData({
      ...initialForm,
      department: departments[0]?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setIsEditing(true);
    setActiveDoctorId(doc._id);
    setFormData({
      name: doc.name,
      specialization: doc.specialization,
      department: doc.department?._id || doc.department,
      qualifications: doc.qualifications || '',
      experienceYears: String(doc.experienceYears || 5),
      consultationFee: String(doc.consultationFee || 100),
      phone: doc.phone || '',
      email: doc.email || '',
      status: doc.status || 'Available',
      availableDays: doc.availableDays || [],
    });
    setIsModalOpen(true);
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.availableDays.includes(day);
      return {
        ...prev,
        availableDays: exists
          ? prev.availableDays.filter((d) => d !== day)
          : [...prev.availableDays, day],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
      };

      if (isEditing) {
        await doctorService.updateDoctor(activeDoctorId, payload);
        toast.success(`Doctor profile updated successfully.`);
      } else {
        await doctorService.createDoctor(payload);
        toast.success(`Doctor registered to roster.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save doctor details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete ${doc.name}?`)) return;
    try {
      await doctorService.deleteDoctor(doc._id);
      toast.success('Doctor removed from directory.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete doctor');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Consultant',
      render: (r, idx) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={getDoctorAvatar(r._id || idx)}
            alt={r.name}
            className="avatar-img avatar-img-sm"
            style={{ width: '38px', height: '38px' }}
          />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>{r.name}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.qualifications}</div>
          </div>
        </div>
      ),
    },
    { key: 'doctorCode', label: 'Doctor ID', width: '110px', render: (r) => <span className="badge badge-primary">{r.doctorCode}</span> },
    { key: 'specialization', label: 'Specialization' },
    {
      key: 'department',
      label: 'Department',
      render: (r) => <span className="badge badge-neutral">{r.department?.name || 'Unassigned'}</span>,
    },
    {
      key: 'fee',
      label: 'Fee',
      width: '90px',
      render: (r) => <strong>${r.consultationFee?.toFixed(2)}</strong>,
    },
    {
      key: 'schedule',
      label: 'Working Days',
      render: (r) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {r.availableDays?.map((d, i) => (
            <span key={i} style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', backgroundColor: 'var(--slate-100)', borderRadius: '3px' }}>
              {d.slice(0, 3)}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (r) => {
        const variants = {
          Available: 'badge-success',
          'On Duty': 'badge-primary',
          'In Surgery': 'badge-warning',
          'On Leave': 'badge-danger',
        };
        return <span className={`badge ${variants[r.status] || 'badge-neutral'}`}>{r.status}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          {hasRole('Administrator', 'Doctor') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '30px', height: '30px' }}
              title="Edit Profile & Schedule"
              onClick={() => handleOpenEdit(r)}
            >
              <Edit3 size={14} />
            </button>
          )}
          {hasRole('Administrator') && (
            <button
              className="topbar-icon-btn"
              style={{ width: '30px', height: '30px', color: 'var(--danger-600)' }}
              title="Delete Doctor"
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
        title="Doctor Directory & Specialist Roster"
        subtitle="Consultants, clinical departments, weekly OPD clinic timings, and consultation fees."
        icon={Stethoscope}
        breadcrumbs={[{ label: 'Doctors' }]}
        badge="Active Specialists"
        actions={
          hasRole('Administrator') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add Specialist
            </button>
          )
        }
      />

      {/* Filter & View Mode Toolbar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="Search doctor by name, specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid vs Table Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--slate-100)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}
              onClick={() => setViewMode('grid')}
              title="Card View"
            >
              <LayoutGrid size={15} /> Cards
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={15} /> Table
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching doctors..." />
      ) : viewMode === 'grid' ? (
        <div className="doctors-grid">
          {doctors.map((doc, idx) => {
            const avatar = getDoctorAvatar(doc._id || idx);
            return (
              <div key={doc._id || idx} className="doctor-card">
                <div className="doctor-card-banner">
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      color: 'white',
                      backdropFilter: 'blur(6px)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {doc.doctorCode}
                  </span>
                </div>

                <div className="doctor-card-body">
                  <div className="doctor-avatar-wrap">
                    <div style={{ position: 'relative' }}>
                      <img src={avatar} alt={doc.name} className="doctor-avatar" />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          right: '3px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: doc.status === 'Available' ? '#10b981' : '#f59e0b',
                          border: '2px solid white',
                        }}
                      />
                    </div>
                    <span className={`badge ${doc.status === 'Available' ? 'badge-success' : 'badge-neutral'}`}>
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="doctor-card-name">{doc.name}</h3>
                    <div className="doctor-card-specialty">{doc.specialization}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {doc.qualifications} • {doc.department?.name || 'Department'}
                    </div>
                  </div>

                  <div className="doctor-meta-row">
                    <div className="doctor-meta-item">
                      <span className="doctor-meta-label">Experience</span>
                      <span className="doctor-meta-value">{doc.experienceYears || 5} Years</span>
                    </div>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />
                    <div className="doctor-meta-item">
                      <span className="doctor-meta-label">Fee</span>
                      <span className="doctor-meta-value" style={{ color: 'var(--success-600)' }}>
                        ${doc.consultationFee?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      OPD Clinic Days
                    </div>
                    <div className="doctor-days-row">
                      {doc.availableDays?.map((d, i) => (
                        <span key={i} className="doctor-day-pill">
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="doctor-card-actions">
                    {hasRole('Administrator', 'Doctor') && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleOpenEdit(doc)}
                      >
                        <Edit3 size={13} /> Edit Roster
                      </button>
                    )}
                    {hasRole('Administrator') && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger-600)', borderColor: 'var(--danger-light)' }}
                        onClick={() => handleDelete(doc)}
                        title="Delete Doctor"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={doctors}
          emptyTitle="No Doctors Listed"
          emptyMessage="No doctors matching criteria. Click 'Add Doctor' to add a specialist."
        />
      )}

      {/* ADD / EDIT DOCTOR MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Update Doctor Profile & Schedule' : 'Register New Medical Doctor'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup label="Doctor Name" required>
              <Input
                required
                placeholder="e.g. Dr. Jane Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Specialization" required>
              <Input
                required
                placeholder="e.g. Cardiothoracic Surgery"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Department" required>
              <Select
                required
                options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Consultation Fee ($)" required>
              <Input
                type="number"
                required
                min="0"
                step="5"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Qualifications">
              <Input
                placeholder="MBBS, MS, FRCS"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Experience (Years)">
              <Input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Direct Phone">
              <Input
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Hospital Status">
              <Select
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'On Duty', label: 'On Duty' },
                  { value: 'In Surgery', label: 'In Surgery' },
                  { value: 'On Leave', label: 'On Leave' },
                ]}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          {/* Available Working Days */}
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Weekly Consultation Days:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {daysOfWeek.map((day) => {
                const isSelected = formData.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={`badge ${isSelected ? 'badge-primary' : 'badge-neutral'}`}
                    style={{ cursor: 'pointer', padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: 'none' }}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : isEditing ? 'Update Doctor' : 'Register Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
