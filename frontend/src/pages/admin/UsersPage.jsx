import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, UserPlus, ShieldCheck, KeyRound,
  Building2, CheckCircle2, XCircle, Edit3, Trash2, RefreshCw, Search,
  Filter, AlertTriangle, ShieldAlert, Users
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { departmentService } from '../../services/departmentService';
import { USER_ROLES } from '../../utils/constants';

const ROLE_OPTIONS = Object.values(USER_ROLES);

export const UsersPage = () => {
  const toast = useToast();
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });

  // Modals
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    email: '',
    password: '',
    role: 'Receptionist',
    department: '',
    phone: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        authService.getUsers({
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
        }),
        departmentService.getDepartments().catch(() => null),
      ]);

      // authService.getUsers returns the full intercepted response (has .data property)
      const userList = usersRes?.data || [];
      setUsers(userList);

      // departmentService.getDepartments returns res.data which is {success, data: [...]}
      const deptList = deptsRes?.data || (Array.isArray(deptsRes) ? deptsRes : []);
      setDepartments(deptList);

      const total = userList.length;
      const active = userList.filter((u) => u.isActive).length;
      setStats({ totalUsers: total, activeUsers: active, inactiveUsers: total - active });
    } catch (err) {
      toast.error(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#!';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleGeneratePassword = () => {
    const pass = generateRandomPassword();
    setFormData((prev) => ({ ...prev, password: pass }));
    toast.info(`Generated: ${pass}`, 'Temp Password');
  };

  const handleOpenProvision = () => {
    setFormData({
      name: '',
      email: '',
      password: generateRandomPassword(),
      role: 'Receptionist',
      department: departments[0]?._id || '',
      phone: '',
    });
    setIsProvisionOpen(true);
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department?._id || u.department || '',
      phone: u.phone || '',
      password: '',
    });
    setIsEditOpen(true);
  };

  const handleOpenResetPassword = (u) => {
    setSelectedUser(u);
    setResetPasswordValue(generateRandomPassword());
    setIsResetPasswordOpen(true);
  };

  const handleOpenDelete = (u) => {
    setSelectedUser(u);
    setIsDeleteOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    try {
      setSubmitting(true);
      await authService.registerUser(formData);
      toast.success(`Account for ${formData.name} provisioned!`, 'User Created');
      setIsProvisionOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to provision user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    try {
      setSubmitting(true);
      await authService.updateUser(selectedUser._id, formData);
      toast.success(`${formData.name} updated!`, 'Account Updated');
      setIsEditOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u) => {
    if (u._id === currentAdmin?.id) {
      toast.warning('You cannot deactivate your own account.');
      return;
    }
    try {
      await authService.toggleUserStatus(u._id);
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}.`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordValue || resetPasswordValue.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setSubmitting(true);
      await authService.resetPassword(selectedUser._id, resetPasswordValue);
      toast.success(`Password for ${selectedUser.name} reset: ${resetPasswordValue}`, 'Password Updated');
      setIsResetPasswordOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (selectedUser._id === currentAdmin?.id) {
      toast.warning('You cannot delete your own account.');
      return;
    }
    try {
      setSubmitting(true);
      await authService.deleteUser(selectedUser._id);
      toast.success(`Account for ${selectedUser.name} deleted.`);
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      Administrator: 'badge-danger',
      Doctor: 'badge-primary',
      Nurse: 'badge-success',
      Pharmacist: 'badge-warning',
      'Laboratory Staff': 'badge-neutral',
      Accountant: 'badge-success',
      Receptionist: 'badge-primary',
    };
    return map[role] || 'badge-neutral';
  };

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: r.isActive ? 'var(--primary-100)' : 'var(--slate-200)',
              color: r.isActive ? 'var(--primary-700)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
            }}
          >
            {r.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <strong>{r.name}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (r) => <span className={`badge ${getRoleBadge(r.role)}`}>{r.role}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (r) => <span>{r.department?.name || '—'}</span>,
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (r) => <span>{r.phone || '—'}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (r) => (
        <span className={`badge ${r.isActive ? 'badge-success' : 'badge-danger'}`}>
          {r.isActive ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (r) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {r.lastLogin
            ? new Date(r.lastLogin).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => handleToggleStatus(r)}
            title={r.isActive ? 'Deactivate' : 'Activate'}
            disabled={r._id === currentAdmin?.id}
          >
            {r.isActive
              ? <XCircle size={14} color="var(--danger-600)" />
              : <CheckCircle2 size={14} color="var(--success-600)" />}
          </button>
          <button className="btn btn-outline btn-xs" onClick={() => handleOpenResetPassword(r)} title="Reset password">
            <KeyRound size={14} />
          </button>
          <button className="btn btn-outline btn-xs" onClick={() => handleOpenEdit(r)} title="Edit">
            <Edit3 size={14} />
          </button>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => handleOpenDelete(r)}
            title="Delete"
            disabled={r._id === currentAdmin?.id}
            style={{ color: 'var(--danger-600)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  /* ─── Shared inline styles ─── */
  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' };
  const selectStyle = {
    width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', fontSize: '0.875rem', background: 'white',
    color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
  };
  const inputStyle = {
    width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none',
  };
  const row2col = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
  const infoBanner = {
    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
    display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="User Accounts & Access Provisioning"
        subtitle="Manage system login credentials, assign hospital roles, and control security access."
        icon={UserCheck}
        breadcrumbs={[{ label: 'Administration' }, { label: 'User Provisioning' }]}
        badge="Security & Access Control"
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline btn-sm" onClick={loadData}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleOpenProvision}>
              <UserPlus size={15} /> Provision New User
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        {[
          { label: 'Total System Users', value: stats.totalUsers, icon: Users, bg: '#e0f2fe', color: '#0284c7' },
          { label: 'Active Credentials', value: stats.activeUsers, icon: CheckCircle2, bg: '#d1fae5', color: '#10b981' },
          { label: 'Deactivated / Suspended', value: stats.inactiveUsers, icon: ShieldAlert, bg: '#fee2e2', color: '#ef4444' },
          { label: 'RBAC Roles Active', value: '7 Roles', icon: ShieldCheck, bg: '#e0e7ff', color: '#6366f1' },
        ].map(({ label, value, icon: Icon, bg, color }, i) => (
          <div key={i} className="metric-card">
            <div className="metric-icon-wrapper" style={{ backgroundColor: bg, color }}>
              <Icon size={24} />
            </div>
            <div>
              <div className="metric-val">{value}</div>
              <div className="metric-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="form-control"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ minWidth: 160 }}>
              <option value="">All Hospital Roles</option>
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: 150 }}>
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="false">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          emptyTitle="No User Accounts Found"
          emptyMessage="No system users match the current filters."
        />
      )}

      {/* ── PROVISION NEW USER MODAL ── */}
      <Modal isOpen={isProvisionOpen} onClose={() => setIsProvisionOpen(false)} title="Provision Hospital User Account" maxWidth="620px">
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ ...infoBanner, background: 'var(--primary-50)', border: '1px solid var(--primary-200)', color: 'var(--primary-800)' }}>
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>This will create a verified login credential in the HMS database. Every provisioning action is logged in the Security Audit Trail.</span>
          </div>

          <div style={row2col}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} placeholder="e.g. Dr. Jennifer Lawrence" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Email Address (Login Username) *</label>
              <input style={inputStyle} type="email" placeholder="e.g. j.lawrence@hospital.org" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>

          <div style={row2col}>
            <div>
              <label style={labelStyle}>Hospital Role (Access Tier) *</label>
              <select
                style={selectStyle}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department Assignment</label>
              <select
                style={selectStyle}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">— General Hospital / None —</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={row2col}>
            <div>
              <label style={labelStyle}>Contact Phone Number</label>
              <input style={inputStyle} type="tel" placeholder="e.g. +1 555-0199" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Initial Password *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input style={{ ...inputStyle, flex: 1 }} type="text" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                <button type="button" className="btn btn-outline btn-sm" onClick={handleGeneratePassword} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Generate
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>Share this with the user for first login</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsProvisionOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Provisioning...' : 'Provision User Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── EDIT USER MODAL ── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Account: ${selectedUser?.name}`} maxWidth="580px">
        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={row2col}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input style={inputStyle} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>

          <div style={row2col}>
            <div>
              <label style={labelStyle}>Assigned Role *</label>
              <select
                style={{ ...selectStyle, opacity: selectedUser?._id === currentAdmin?.id ? 0.6 : 1 }}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={selectedUser?._id === currentAdmin?.id}
                required
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {selectedUser?._id === currentAdmin?.id && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>Cannot change your own role</span>
              )}
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select
                style={selectStyle}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">— General Hospital / None —</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Contact Phone</label>
            <input style={inputStyle} type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── RESET PASSWORD MODAL ── */}
      <Modal isOpen={isResetPasswordOpen} onClose={() => setIsResetPasswordOpen(false)} title={`Reset Password: ${selectedUser?.name}`} maxWidth="440px">
        <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ ...infoBanner, background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
            <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>The user will need this new password immediately on their next sign-in.</span>
          </div>
          <div>
            <label style={labelStyle}>New Temporary Password *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input style={{ ...inputStyle, flex: 1 }} type="text" value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)} required />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setResetPasswordValue(generateRandomPassword())} style={{ flexShrink: 0 }}>
                Generate
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsResetPasswordOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Updating...' : 'Confirm Reset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── DELETE CONFIRM MODAL ── */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete User Account" maxWidth="420px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Permanently delete the account for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
          </p>
          <div style={{ ...infoBanner, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>This action cannot be undone. All login credentials will be permanently revoked.</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger-600)', color: 'white', border: 'none' }}
              onClick={handleDeleteSubmit}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
