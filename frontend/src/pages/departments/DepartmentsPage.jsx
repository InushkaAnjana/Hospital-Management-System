import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Edit3, Trash2, Users, LayoutGrid,
  List, CheckCircle2, Stethoscope, ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, Textarea } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { departmentService } from '../../services/departmentService';
import { getDepartmentImage, getDoctorAvatar } from '../../utils/imageAssets';

export const DepartmentsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDeptId, setActiveDeptId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await departmentService.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setActiveDeptId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditing(true);
    setActiveDeptId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      headOfDepartment: dept.headOfDepartment || '',
      status: dept.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await departmentService.updateDepartment(activeDeptId, formData);
        toast.success(`Department ${formData.name} updated.`);
      } else {
        await departmentService.createDepartment(formData);
        toast.success(`Department ${formData.name} created.`);
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete department ${dept.name}?`)) return;
    try {
      await departmentService.deleteDepartment(dept._id);
      toast.success('Department deleted successfully.');
      loadDepartments();
    } catch (err) {
      toast.error(err.message || 'Failed to delete department');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={getDepartmentImage(r.code)}
            alt={r.name}
            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <strong>{r.name}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {r.code}</div>
          </div>
        </div>
      ),
    },
    { key: 'hod', label: 'Head of Department (HOD)', render: (r) => r.headOfDepartment || 'Unassigned' },
    {
      key: 'doctors',
      label: 'Doctors',
      width: '120px',
      render: (r) => (
        <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Users size={12} /> {r.doctorCount || 0} Staff
        </span>
      ),
    },
    { key: 'desc', label: 'Description', render: (r) => <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{r.description || '-'}</span> },
    {
      key: 'status',
      label: 'Status',
      width: '90px',
      render: (r) => <span className={`badge ${r.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>{r.status}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
          {hasRole('Administrator') && (
            <>
              <button
                className="topbar-icon-btn"
                style={{ width: '30px', height: '30px' }}
                title="Edit Department"
                onClick={() => handleOpenEdit(r)}
              >
                <Edit3 size={14} />
              </button>
              <button
                className="topbar-icon-btn"
                style={{ width: '30px', height: '30px', color: 'var(--danger-600)' }}
                title="Delete Department"
                onClick={() => handleDelete(r)}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Hospital Departments & Specialized Units"
        subtitle="Clinical divisions, operative wings, medical staff allocations, and department leadership."
        icon={Building2}
        breadcrumbs={[{ label: 'Departments' }]}
        badge="Clinical Infrastructure"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--slate-100)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : ''}`}
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setViewMode('grid')}
                title="Cards View"
              >
                <LayoutGrid size={15} /> Showcase
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={15} /> Table
              </button>
            </div>

            {hasRole('Administrator') && (
              <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                <Plus size={15} /> Add Department
              </button>
            )}
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner message="Fetching hospital departments..." />
      ) : viewMode === 'grid' ? (
        <div className="departments-grid">
          {departments.map((dept, idx) => {
            const photo = getDepartmentImage(dept.code);
            const hodAvatar = getDoctorAvatar(idx);
            return (
              <div key={dept._id || idx} className="dept-card">
                <div className="dept-card-image-wrap">
                  <img src={photo} alt={dept.name} className="dept-card-image" />
                  <span className="dept-code-tag">{dept.code}</span>
                  <div className="dept-card-overlay">
                    <h3 className="dept-card-title">{dept.name}</h3>
                  </div>
                </div>

                <div className="dept-card-body">
                  <div className="dept-head-info">
                    <img
                      src={hodAvatar}
                      alt={dept.headOfDepartment}
                      className="avatar-img avatar-img-sm"
                      style={{ width: '36px', height: '36px' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Head of Department
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dept.headOfDepartment || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <p className="dept-card-desc">
                    {dept.description || 'Specialized clinical care, consultations, and inpatient services.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.875rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }} />
                      <span className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                        {dept.status}
                      </span>
                    </div>

                    {hasRole('Administrator') && (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="topbar-icon-btn"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit Department"
                          onClick={() => handleOpenEdit(dept)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="topbar-icon-btn"
                          style={{ width: '32px', height: '32px', color: 'var(--danger-600)' }}
                          title="Delete Department"
                          onClick={() => handleDelete(dept)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          data={departments}
          emptyTitle="No Departments Recorded"
          emptyMessage="Click 'Add Department' to initialize a clinical division."
        />
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Department' : 'Register New Hospital Department'}
        maxWidth="540px"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormGroup label="Department Name" required>
              <Input
                required
                placeholder="e.g. Cardiology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Department Code" required hint="Short code (e.g. CARD, NEUR)">
              <Input
                required
                placeholder="e.g. CARD"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </FormGroup>

            <FormGroup label="Head of Department (HOD)">
              <Input
                placeholder="e.g. Dr. Gregory House"
                value={formData.headOfDepartment}
                onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Status">
              <Select
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Description">
              <Textarea
                rows={3}
                placeholder="Clinical description and scope of practice..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormGroup>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : isEditing ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
