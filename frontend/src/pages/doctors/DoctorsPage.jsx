import React, { useState, useEffect, useCallback } from 'react';
import { Stethoscope, Plus, Search, Edit3, Trash2, Calendar, Clock, DollarSign } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';

export const DoctorsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

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
    { key: 'doctorCode', label: 'Doctor ID', width: '110px', render: (r) => <span className="badge badge-primary">{r.doctorCode}</span> },
    {
      key: 'name',
      label: 'Consultant Name',
      render: (r) => (
        <div>
          <strong>{r.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.qualifications}</div>
        </div>
      ),
    },
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
        title="Doctor Directory & Schedules"
        subtitle="Specialist consultants, clinical departments, and weekly working rosters."
        icon={Stethoscope}
        breadcrumbs={[{ label: 'Doctors' }]}
        badge="Live Staff"
        actions={
          hasRole('Administrator') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add Doctor
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
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching doctors..." />
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
