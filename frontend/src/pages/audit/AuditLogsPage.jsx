import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, Filter, ShieldAlert, Clock, User } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/NotificationContext';
import { auditService } from '../../services/auditService';

export const AuditLogsPage = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditService.getAuditLogs({
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        search: searchTerm || undefined,
      });
      setLogs(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  }, [moduleFilter, actionFilter, searchTerm, toast]);

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      width: '160px',
      render: (r) => (
        <div>
          <strong>{new Date(r.createdAt).toLocaleDateString()}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(r.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'User / Actor',
      render: (r) => (
        <div>
          <strong>{r.userName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role: {r.userRole}</div>
        </div>
      ),
    },
    {
      key: 'module',
      label: 'Module',
      width: '130px',
      render: (r) => <span className="badge badge-primary">{r.module}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      width: '130px',
      render: (r) => {
        const variants = {
          CREATE: 'badge-success',
          UPDATE: 'badge-warning',
          DELETE: 'badge-danger',
          DISCHARGE: 'badge-primary',
          DISPENSE: 'badge-success',
          RECORD_PAYMENT: 'badge-success',
          COLLECT_SAMPLE: 'badge-primary',
          ENTER_RESULT: 'badge-primary',
          LOGIN: 'badge-neutral',
        };
        return <span className={`badge ${variants[r.action] || 'badge-neutral'}`}>{r.action}</span>;
      },
    },
    {
      key: 'description',
      label: 'Activity Description',
      render: (r) => <span>{r.description}</span>,
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      width: '120px',
      render: (r) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.ipAddress || '127.0.0.1'}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="System Security & Audit Trail"
        subtitle="Immutable chronological logs of user logins, clinical updates, drug dispensing, payments, and administrative actions."
        icon={ShieldCheck}
        breadcrumbs={[{ label: 'Audit Logs' }]}
        badge="HIPAA Compliant"
      />

      {/* Filter toolbar */}
      <div className="card" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              placeholder="Search audit descriptions, user names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">All Modules</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Billing">Billing</option>
              <option value="Admissions">Admissions</option>
              <option value="Staff">Staff</option>
              <option value="Patients">Patients</option>
              <option value="Appointments">Appointments</option>
              <option value="Auth">Authentication</option>
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="DISCHARGE">DISCHARGE</option>
              <option value="DISPENSE">DISPENSE</option>
              <option value="RECORD_PAYMENT">RECORD_PAYMENT</option>
              <option value="COLLECT_SAMPLE">COLLECT_SAMPLE</option>
              <option value="ENTER_RESULT">ENTER_RESULT</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving security audit events..." />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          emptyTitle="No Audit Events Found"
          emptyMessage="No security or clinical audit logs matching criteria."
        />
      )}
    </div>
  );
};

export default AuditLogsPage;
