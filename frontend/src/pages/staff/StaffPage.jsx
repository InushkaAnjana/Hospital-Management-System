import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Search, Eye, Edit3, Trash2,
  CheckCircle2, Clock, Calendar, Check, X, Shield,
  Award, Briefcase
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal, FormGroup, Input, Select, FormGrid } from '../../components/common/FormComponents';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { departmentService } from '../../services/departmentService';

export const StaffPage = () => {
  const toast = useToast();
  const { hasRole } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
  });

  // Registration form
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    role: 'Nurse',
    department: '',
    designation: 'Senior Staff Nurse',
    salary: '4500',
    shift: 'Morning',
  };
  const [formData, setFormData] = useState(initialForm);

  // Attendance form
  const [attendanceData, setAttendanceData] = useState({
    status: 'Present',
    checkIn: '08:30 AM',
    checkOut: '04:30 PM',
    notes: '',
  });

  // Leave form
  const [leaveData, setLeaveData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, deptsRes, statsRes] = await Promise.all([
        staffService.getStaff({
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
        }),
        departmentService.getDepartments(),
        staffService.getStats().catch(() => null),
      ]);

      setStaffList(staffRes.data || []);
      setDepartments(deptsRes || []);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      toast.error(err.message || 'Failed to load staff records');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenRegister = () => {
    setIsEditing(false);
    setActiveStaff(null);
    setFormData({
      ...initialForm,
      department: departments[0]?._id || '',
    });
    setIsRegisterOpen(true);
  };

  const handleOpenEdit = (member) => {
    setIsEditing(true);
    setActiveStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department?._id || member.department || '',
      designation: member.designation || '',
      salary: String(member.salary || ''),
      shift: member.shift || 'Morning',
    });
    setIsRegisterOpen(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        salary: Number(formData.salary) || 0,
      };

      if (isEditing) {
        await staffService.updateStaff(activeStaff._id, payload);
        toast.success(`Updated staff profile for ${formData.name}`);
      } else {
        await staffService.createStaff(payload);
        toast.success(`Registered new employee ${formData.name}`);
      }
      setIsRegisterOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAttendance = (member) => {
    setActiveStaff(member);
    setAttendanceData({
      status: 'Present',
      checkIn: '08:30 AM',
      checkOut: '04:30 PM',
      notes: '',
    });
    setIsAttendanceOpen(true);
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!activeStaff) return;

    setSubmitting(true);
    try {
      await staffService.markAttendance(activeStaff._id, attendanceData);
      toast.success(`Marked attendance as ${attendanceData.status} for ${activeStaff.name}`);
      setIsAttendanceOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLeave = (member) => {
    setActiveStaff(member);
    setLeaveData({
      leaveType: 'Casual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      reason: 'Medical / Personal Leave',
    });
    setIsLeaveOpen(true);
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!activeStaff) return;

    setSubmitting(true);
    try {
      await staffService.applyLeave(activeStaff._id, leaveData);
      toast.success(`Leave request submitted for ${activeStaff.name}`);
      setIsLeaveOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLeaveStatus = async (staffId, leaveId, status) => {
    try {
      await staffService.updateLeaveStatus(staffId, leaveId, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update leave status');
    }
  };

  const handleOpenView = (member) => {
    setActiveStaff(member);
    setIsViewOpen(true);
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.name} (${member.employeeCode})?`)) return;
    try {
      await staffService.deleteStaff(member._id);
      toast.success('Staff record removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff record');
    }
  };

  const columns = [
    {
      key: 'employeeCode',
      label: 'Staff ID',
      width: '110px',
      render: (r) => <span className="badge badge-primary">{r.employeeCode}</span>,
    },
    {
      key: 'name',
      label: 'Employee Name',
      render: (r) => (
        <div>
          <strong>{r.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {r.email} | {r.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Hospital Role',
      render: (r) => (
        <div>
          <strong>{r.role}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.designation}</div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      render: (r) => r.department?.name || 'Central Administration',
    },
    {
      key: 'shift',
      label: 'Shift',
      width: '110px',
      render: (r) => <span className="badge badge-neutral">{r.shift}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (r) => {
        const variants = {
          Active: 'badge-success',
          'On Leave': 'badge-warning',
          Resigned: 'badge-danger',
        };
        return <span className={`badge ${variants[r.status] || 'badge-neutral'}`}>{r.status}</span>;
      },
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
            style={{ width: '28px', height: '28px' }}
            title="View Details, Attendance & Leave"
            onClick={() => handleOpenView(r)}
          >
            <Eye size={14} />
          </button>
          <button
            className="topbar-icon-btn"
            style={{ width: '28px', height: '28px', color: 'var(--primary-600)' }}
            title="Mark Daily Attendance"
            onClick={() => handleOpenAttendance(r)}
          >
            <Calendar size={14} />
          </button>
          <button
            className="topbar-icon-btn"
            style={{ width: '28px', height: '28px', color: 'var(--warning-600)' }}
            title="Apply Leave"
            onClick={() => handleOpenLeave(r)}
          >
            <Clock size={14} />
          </button>
          {hasRole('Administrator') && (
            <>
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px' }}
                title="Edit Employee"
                onClick={() => handleOpenEdit(r)}
              >
                <Edit3 size={14} />
              </button>
              <button
                className="topbar-icon-btn"
                style={{ width: '28px', height: '28px', color: 'var(--danger-600)' }}
                title="Delete Employee"
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
        title="Staff & Human Resource Management"
        subtitle="Clinical and operational personnel roster, departmental allocations, attendance logs, and leave processing."
        icon={Users}
        breadcrumbs={[{ label: 'Staff' }]}
        badge="Live HR"
        actions={
          hasRole('Administrator') && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenRegister}>
              <UserPlus size={15} /> Register Staff
            </button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.total}</div>
            <div className="metric-label">Total Registered Staff</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.active}</div>
            <div className="metric-label">Active on Duty</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.onLeave}</div>
            <div className="metric-label">Personnel on Leave</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div className="metric-val">{departments.length}</div>
            <div className="metric-label">Assigned Departments</div>
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
              placeholder="Search by name, employee code, email, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Hospital Roles</option>
              <option value="Doctor">Medical Doctor</option>
              <option value="Nurse">Nursing Staff</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Laboratory Staff">Laboratory Staff</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Accountant">Accountant</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading employee roster..." />
      ) : (
        <DataTable
          columns={columns}
          data={staffList}
          emptyTitle="No Staff Members Found"
          emptyMessage="No employees match your search query. Click 'Register Staff' to onboard a staff member."
        />
      )}

      {/* REGISTER / EDIT STAFF MODAL */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title={isEditing ? 'Update Employee Details' : 'Register New Hospital Staff'}
        maxWidth="680px"
      >
        <form onSubmit={handleRegisterSubmit}>
          <FormGrid>
            <FormGroup label="Full Name" required>
              <Input
                required
                placeholder="e.g. Sarah Connor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Official Email" required>
              <Input
                type="email"
                required
                placeholder="s.connor@hospital.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Direct Phone" required>
              <Input
                required
                placeholder="+1 (555) 019-4822"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Hospital Role" required>
              <Select
                required
                options={[
                  { value: 'Nurse', label: 'Nurse' },
                  { value: 'Doctor', label: 'Doctor / Physician' },
                  { value: 'Receptionist', label: 'Receptionist' },
                  { value: 'Laboratory Staff', label: 'Laboratory Staff / Technician' },
                  { value: 'Pharmacist', label: 'Pharmacist' },
                  { value: 'Accountant', label: 'Accountant' },
                  { value: 'Administrator', label: 'Administrator' },
                  { value: 'Paramedic', label: 'Paramedic / EMS' },
                  { value: 'Support Staff', label: 'Support Staff' },
                ]}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Department">
              <Select
                options={departments.map((d) => ({ value: d._id, label: `${d.name} (${d.code})` }))}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Designation / Title">
              <Input
                placeholder="e.g. Head Nurse, ER Specialist"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Monthly Base Salary ($)">
              <Input
                type="number"
                min="0"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Duty Shift">
              <Select
                options={[
                  { value: 'Morning', label: 'Morning Shift (08:00 - 16:00)' },
                  { value: 'Evening', label: 'Evening Shift (16:00 - 00:00)' },
                  { value: 'Night', label: 'Night Shift (00:00 - 08:00)' },
                  { value: 'Rotational', label: 'Rotational Roster' },
                ]}
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MARK ATTENDANCE MODAL */}
      <Modal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        title={`Mark Daily Attendance - ${activeStaff?.name}`}
        maxWidth="440px"
      >
        <form onSubmit={handleAttendanceSubmit}>
          <FormGroup label="Attendance Status" required>
            <Select
              required
              options={[
                { value: 'Present', label: 'Present (On Time)' },
                { value: 'Late', label: 'Late Arrival' },
                { value: 'Half Day', label: 'Half Day' },
                { value: 'Absent', label: 'Absent' },
                { value: 'On Leave', label: 'Approved Leave' },
              ]}
              value={attendanceData.status}
              onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
            />
          </FormGroup>

          <FormGrid>
            <FormGroup label="Check In Time">
              <Input
                value={attendanceData.checkIn}
                onChange={(e) => setAttendanceData({ ...attendanceData, checkIn: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="Check Out Time">
              <Input
                value={attendanceData.checkOut}
                onChange={(e) => setAttendanceData({ ...attendanceData, checkOut: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup label="Notes / Shift Remarks">
            <Input
              placeholder="e.g. Covered ER night duty"
              value={attendanceData.notes}
              onChange={(e) => setAttendanceData({ ...attendanceData, notes: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsAttendanceOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Logging...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* APPLY LEAVE MODAL */}
      <Modal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        title={`Submit Leave Application - ${activeStaff?.name}`}
        maxWidth="480px"
      >
        <form onSubmit={handleLeaveSubmit}>
          <FormGroup label="Leave Type" required>
            <Select
              required
              options={[
                { value: 'Casual', label: 'Casual Leave' },
                { value: 'Sick', label: 'Sick / Medical Leave' },
                { value: 'Annual', label: 'Annual / Paid Vacation' },
                { value: 'Maternity', label: 'Maternity Leave' },
                { value: 'Emergency', label: 'Emergency Leave' },
              ]}
              value={leaveData.leaveType}
              onChange={(e) => setLeaveData({ ...leaveData, leaveType: e.target.value })}
            />
          </FormGroup>

          <FormGrid>
            <FormGroup label="Start Date" required>
              <Input
                type="date"
                required
                value={leaveData.startDate}
                onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
              />
            </FormGroup>
            <FormGroup label="End Date" required>
              <Input
                type="date"
                required
                value={leaveData.endDate}
                onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup label="Reason for Absence" required>
            <textarea
              className="form-input"
              rows={2}
              required
              placeholder="Brief explanation for leave request..."
              value={leaveData.reason}
              onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
            />
          </FormGroup>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsLeaveOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS & LEAVE APPROVALS MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Staff Dossier - ${activeStaff?.name} (${activeStaff?.employeeCode})`}
        maxWidth="680px"
      >
        {activeStaff && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
              <div>
                <strong>{activeStaff.name}</strong> ({activeStaff.role})
                <div>Designation: {activeStaff.designation || 'Staff'}</div>
                <div>Department: {activeStaff.department?.name || 'Central Admin'}</div>
                <div>Email: {activeStaff.email}</div>
              </div>
              <div>
                <div>Phone: {activeStaff.phone}</div>
                <div>Duty Shift: {activeStaff.shift}</div>
                <div>Joined: {new Date(activeStaff.joiningDate).toLocaleDateString()}</div>
                <div>Status: <span className="badge badge-success">{activeStaff.status}</span></div>
              </div>
            </div>

            {/* Leave Records & Approvals */}
            <div style={{ marginTop: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Leave Applications & Status</h4>
              {activeStaff.leaveRecords && activeStaff.leaveRecords.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeStaff.leaveRecords.map((l, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid var(--slate-200)',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong>{l.leaveType} Leave:</strong> {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason: {l.reason}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                          {l.status}
                        </span>
                        {l.status === 'Pending' && hasRole('Administrator') && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => handleUpdateLeaveStatus(activeStaff._id, l._id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger-600)' }}
                              onClick={() => handleUpdateLeaveStatus(activeStaff._id, l._id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
                  No leave requests on record for this staff member.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setIsViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffPage;
