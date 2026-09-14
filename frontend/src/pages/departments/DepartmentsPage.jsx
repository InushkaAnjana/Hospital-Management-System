import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit3, Trash2, Users } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, Textarea } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { departmentService } from '../../services/departmentService';

export const DepartmentsPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
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
    { key: 'code', label: 'Code', width: '100px', render: (r) => <span className="badge badge-primary">{r.code}</span> },
    { key: 'name', label: 'Department Name', render: (r) => <strong>{r.name}</strong> },
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
        title="Department Management"
        subtitle="Clinical divisions, operative units, and department head assignments."
        icon={Building2}
        breadcrumbs={[{ label: 'Departments' }]}
        badge="Active Infrastructure"
        actions={
          hasRole('Administrator') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add Department
            </button>
          )
        }
      />

      {loading ? (
        <LoadingSpinner message="Fetching hospital departments..." />
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
