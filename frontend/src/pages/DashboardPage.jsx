import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users, Calendar, Bed, FlaskConical, Pill, Receipt,
  Activity, ArrowUpRight, Plus, CheckCircle, Database, RefreshCw
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { HealthCard } from '../components/health/HealthCard';
import { DataTable } from '../components/common/DataTable';
import { useToast } from '../context/NotificationContext';
import { dashboardService } from '../services/dashboardService';

export const DashboardPage = () => {
  const { health, loading: healthLoading, error, lastChecked, refetch } = useOutletContext();
  const toast = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      setDashboardData(res.data || res);
    } catch (err) {
      toast.error('Unable to fetch live dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const kpisData = dashboardData?.kpis || {};

  const kpis = [
    {
      label: 'Total Registered Patients',
      value: kpisData.totalPatients !== undefined ? `${kpisData.totalPatients}` : '...',
      icon: Users,
      color: '#0284c7',
      bg: '#e0f2fe',
    },
    {
      label: "Today's Appointments",
      value: kpisData.todayAppointments !== undefined ? `${kpisData.todayAppointments}` : '...',
      icon: Calendar,
      color: '#6366f1',
      bg: '#e0e7ff',
    },
    {
      label: 'Admitted Inpatients (IPD)',
      value: kpisData.admittedPatients !== undefined ? `${kpisData.admittedPatients} / 80 Beds` : '...',
      icon: Bed,
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      label: 'Pending Lab Tests',
      value: kpisData.pendingLabTests !== undefined ? `${kpisData.pendingLabTests} Orders` : '...',
      icon: FlaskConical,
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: 'Low Stock Medicines',
      value: kpisData.lowStockMedicines !== undefined ? `${kpisData.lowStockMedicines} Alerts` : '...',
      icon: Pill,
      color: '#ef4444',
      bg: '#fee2e2',
    },
    {
      label: "Today's Revenue",
      value: kpisData.todayRevenue !== undefined ? `$${Number(kpisData.todayRevenue).toFixed(2)}` : '...',
      icon: Receipt,
      color: '#059669',
      bg: '#d1fae5',
    },
  ];

  const recentActivities = [
    ...(dashboardData?.recentAppointments?.map((a) => ({
      id: a.appointmentNumber || 'APP',
      patient: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Patient',
      service: a.reason || 'Clinical Consultation',
      doctor: a.doctor?.name ? `Dr. ${a.doctor.name}` : 'Consultant',
      status: a.status || 'Scheduled',
      time: 'Consultation',
    })) || []),
    ...(dashboardData?.recentInvoices?.map((inv) => ({
      id: inv.invoiceNumber,
      patient: inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : 'Billed Patient',
      service: `Hospital Invoice ($${Number(inv.totalAmount).toFixed(2)})`,
      doctor: 'Accounts Desk',
      status: inv.paymentStatus,
      time: new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })) || []),
    ...(dashboardData?.recentAdmissions?.map((adm) => ({
      id: adm.admissionNumber,
      patient: adm.patient ? `${adm.patient.firstName} ${adm.patient.lastName}` : 'Inpatient',
      service: `Ward Admission (${adm.ward} - ${adm.bedNumber})`,
      doctor: adm.doctor?.name ? `Dr. ${adm.doctor.name}` : 'Attending',
      status: adm.status,
      time: new Date(adm.admissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })) || []),
  ];

  const activityColumns = [
    { key: 'id', label: 'Reference ID', width: '130px', render: (r) => <strong>{r.id}</strong> },
    { key: 'patient', label: 'Patient Name', render: (row) => <strong>{row.patient}</strong> },
    { key: 'service', label: 'Service / Procedure' },
    { key: 'doctor', label: 'Attending / Department' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const variants = {
          Completed: 'badge-success',
          Paid: 'badge-success',
          'In Lab': 'badge-warning',
          'Partially Paid': 'badge-warning',
          Scheduled: 'badge-primary',
          Admitted: 'badge-primary',
          Unpaid: 'badge-danger',
        };
        return <span className={`badge ${variants[row.status] || 'badge-neutral'}`}>{row.status}</span>;
      },
    },
    { key: 'time', label: 'Reference Time', align: 'right' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <PageHeader
        title="Hospital Executive Dashboard"
        subtitle="Operational overview, real-time clinical workload, and live hospital telemetry."
        icon={Activity}
        badge="Live System"
        actions={
          <button
            className="btn btn-outline btn-sm"
            onClick={fetchDashboardStats}
            title="Refresh Metrics"
          >
            <RefreshCw size={14} /> Refresh Data
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
          loading={healthLoading}
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
                  <h3 className="card-title">Hospital System Modules</h3>
                  <p className="card-subtitle">Operational Core Architecture</p>
                </div>
              </div>
              <span className="badge badge-success">Online</span>
            </div>

            <div className="diagnostic-list">
              <div className="diagnostic-item">
                <span className="diagnostic-label">Medical Specialists</span>
                <span className="diagnostic-value">{kpisData.totalDoctors || 0} Registered Doctors</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Hospital Staff</span>
                <span className="diagnostic-value">{kpisData.totalStaff || 0} Active Personnel</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Pathology & Diagnostics</span>
                <span className="diagnostic-value">Real-time Result Verification</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Pharmacy & Dispensing</span>
                <span className="diagnostic-value">Auto-Inventory Deduction Active</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Link to="/reports" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
              Operational Reports
            </Link>
            <Link to="/patients" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
              Manage Patients <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.875rem' }}>
          Real-Time Hospital Activities & Clinical Events
        </h3>
        <DataTable
          columns={activityColumns}
          data={recentActivities}
          searchPlaceholder="Search recent events..."
          emptyTitle="No Recent Activities"
          emptyMessage="No clinical appointments, invoices, or admissions recorded today."
        />
      </div>
    </div>
  );
};

export default DashboardPage;
