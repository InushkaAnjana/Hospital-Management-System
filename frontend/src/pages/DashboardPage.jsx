import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users, Calendar, Bed, FlaskConical, Pill, Receipt,
  Activity, ArrowUpRight, Plus, CheckCircle, Database
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { HealthCard } from '../components/health/HealthCard';
import { DataTable } from '../components/common/DataTable';
import { useToast } from '../context/NotificationContext';

export const DashboardPage = () => {
  const { health, loading, error, lastChecked, refetch } = useOutletContext();
  const toast = useToast();

  const kpis = [
    { label: 'Total Registered Patients', value: '1,420', icon: Users, color: '#0284c7', bg: '#e0f2fe' },
    { label: "Today's Appointments", value: '38', icon: Calendar, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Admitted Inpatients (IPD)', value: '64 / 80 Beds', icon: Bed, color: '#10b981', bg: '#d1fae5' },
    { label: 'Pending Lab Tests', value: '14 Orders', icon: FlaskConical, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Low Stock Medicines', value: '3 Alerts', icon: Pill, color: '#ef4444', bg: '#fee2e2' },
    { label: "Today's Revenue", value: '$4,850.00', icon: Receipt, color: '#059669', bg: '#d1fae5' },
  ];

  const recentActivities = [
    { id: 'ACT-101', patient: 'Eleanor Vance', service: 'Cardiology Consultation', doctor: 'Dr. Robert Smith', status: 'Completed', time: '10 mins ago' },
    { id: 'ACT-102', patient: 'Arthur Pendelton', service: 'Complete Blood Count (CBC)', doctor: 'Dr. Jane Miller', status: 'In Lab', time: '25 mins ago' },
    { id: 'ACT-103', patient: 'Clara Oswald', service: 'Amoxicillin 500mg Dispensing', doctor: 'Dr. Robert Smith', status: 'Dispensed', time: '42 mins ago' },
    { id: 'ACT-104', patient: 'David Tennant', service: 'IPD Ward Admission (Room 302)', doctor: 'Dr. Alan Grant', status: 'Admitted', time: '1 hour ago' },
  ];

  const activityColumns = [
    { key: 'id', label: 'Reference ID', width: '120px' },
    { key: 'patient', label: 'Patient Name', render: (row) => <strong>{row.patient}</strong> },
    { key: 'service', label: 'Service / Procedure' },
    { key: 'doctor', label: 'Attending Doctor' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variants = {
          Completed: 'badge-success',
          'In Lab': 'badge-warning',
          Dispensed: 'badge-primary',
          Admitted: 'badge-neutral',
        };
        return <span className={`badge ${variants[row.status] || 'badge-primary'}`}>{row.status}</span>;
      },
    },
    { key: 'time', label: 'Timestamp', align: 'right' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <PageHeader
        title="Hospital Executive Dashboard"
        subtitle="Operational overview, real-time clinical workload, and system diagnostics."
        icon={Activity}
        badge="Live System"
        actions={
          <button
            className="btn btn-primary btn-sm"
            onClick={() => toast.success('Triggered system sync with MongoDB Atlas.')}
          >
            <Plus size={15} /> Quick Action
          </button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="metric-card">
              <div className="metric-icon-wrapper" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                <Icon size={24} />
              </div>
              <div>
                <div className="metric-val">{kpi.value}</div>
                <div className="metric-label">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Backend Connection Diagnostics & Quick Workflows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <HealthCard
          health={health}
          loading={loading}
          error={error}
          lastChecked={lastChecked}
          onRefresh={refetch}
        />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon-box success">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h3 className="card-title">Frontend Foundation Status</h3>
                  <p className="card-subtitle">Architecture & Component Health</p>
                </div>
              </div>
              <span className="badge badge-success">Ready</span>
            </div>

            <div className="diagnostic-list">
              <div className="diagnostic-item">
                <span className="diagnostic-label">Sidebar & Navigation</span>
                <span className="diagnostic-value">14 Registered Modules</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">UI Design System</span>
                <span className="diagnostic-value">CSS Design Tokens Active</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Notification System</span>
                <span className="diagnostic-value">Toast Context Operational</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Reusable Elements</span>
                <span className="diagnostic-value">Header, Table, Form, Modal</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => toast.info('Toast notification system verified!')}
            >
              Test Notification
            </button>
            <Link to="/patients" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
              Explore Modules <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.875rem' }}>
          Recent Hospital Transactions
        </h3>
        <DataTable
          columns={activityColumns}
          data={recentActivities}
          searchPlaceholder="Search recent activities..."
          emptyTitle="No Recent Activities"
        />
      </div>
    </div>
  );
};
