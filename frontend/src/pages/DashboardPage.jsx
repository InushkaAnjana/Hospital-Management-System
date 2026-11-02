import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users, Calendar, Bed, FlaskConical, Pill, Receipt,
  Activity, ArrowUpRight, Plus, CheckCircle, Database, RefreshCw,
  HeartPulse, Stethoscope, Building2, Sparkles, AlertCircle, TrendingUp
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { HealthCard } from '../components/health/HealthCard';
import { DataTable } from '../components/common/DataTable';
import { useToast } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { getPatientAvatar, getRoleAvatar, IMAGES } from '../utils/imageAssets';

export const DashboardPage = () => {
  const { health, loading: healthLoading, error, lastChecked, refetch } = useOutletContext();
  const { user } = useAuth();
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
  const userAvatar = getRoleAvatar(user?.role);

  const kpis = [
    {
      label: 'Registered Patients',
      value: kpisData.totalPatients !== undefined ? `${kpisData.totalPatients}` : '...',
      trend: '+12% this month',
      progress: 75,
      icon: Users,
      color: '#0284c7',
      bg: '#e0f2fe',
    },
    {
      label: "Today's Appointments",
      value: kpisData.todayAppointments !== undefined ? `${kpisData.todayAppointments}` : '...',
      trend: '8 slots remaining',
      progress: 60,
      icon: Calendar,
      color: '#6366f1',
      bg: '#e0e7ff',
    },
    {
      label: 'Admitted Inpatients',
      value: kpisData.admittedPatients !== undefined ? `${kpisData.admittedPatients} / 80` : '...',
      trend: `${Math.round(((kpisData.admittedPatients || 0) / 80) * 100)}% Bed Occupancy`,
      progress: Math.min(100, Math.round(((kpisData.admittedPatients || 0) / 80) * 100)),
      icon: Bed,
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      label: 'Pending Lab Tests',
      value: kpisData.pendingLabTests !== undefined ? `${kpisData.pendingLabTests}` : '...',
      trend: 'Diagnostic Queue',
      progress: 40,
      icon: FlaskConical,
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: 'Low Stock Medicines',
      value: kpisData.lowStockMedicines !== undefined ? `${kpisData.lowStockMedicines}` : '...',
      trend: 'Reorder Alerts',
      progress: 25,
      icon: Pill,
      color: '#ef4444',
      bg: '#fee2e2',
    },
    {
      label: "Today's Revenue",
      value: kpisData.todayRevenue !== undefined ? `$${Number(kpisData.todayRevenue).toFixed(2)}` : '...',
      trend: '+8.4% vs avg',
      progress: 85,
      icon: Receipt,
      color: '#059669',
      bg: '#d1fae5',
    },
  ];

  const recentActivities = [
    ...(dashboardData?.recentAppointments?.map((a, idx) => ({
      id: a.appointmentNumber || `APP-${100 + idx}`,
      avatar: getPatientAvatar(idx),
      patient: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Patient',
      service: a.reason || 'Clinical Consultation',
      doctor: a.doctor?.name ? `Dr. ${a.doctor.name}` : 'Consultant',
      status: a.status || 'Scheduled',
      time: 'Consultation',
    })) || []),
    ...(dashboardData?.recentInvoices?.map((inv, idx) => ({
      id: inv.invoiceNumber,
      avatar: getPatientAvatar(idx + 3),
      patient: inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : 'Billed Patient',
      service: `Hospital Invoice ($${Number(inv.totalAmount).toFixed(2)})`,
      doctor: 'Accounts Desk',
      status: inv.paymentStatus,
      time: new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })) || []),
    ...(dashboardData?.recentAdmissions?.map((adm, idx) => ({
      id: adm.admissionNumber,
      avatar: getPatientAvatar(idx + 5),
      patient: adm.patient ? `${adm.patient.firstName} ${adm.patient.lastName}` : 'Inpatient',
      service: `Ward Admission (${adm.ward} - ${adm.bedNumber})`,
      doctor: adm.doctor?.name ? `Dr. ${adm.doctor.name}` : 'Attending',
      status: adm.status,
      time: new Date(adm.admissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })) || []),
  ];

  const departmentShowcases = [
    { code: 'CARD', name: 'Cardiology', image: IMAGES.departments.CARD, head: 'Dr. Gregory House', beds: '16 Beds' },
    { code: 'SURG', name: 'General Surgery', image: IMAGES.departments.SURG, head: 'Dr. Meredith Grey', beds: '20 Beds' },
    { code: 'NEUR', name: 'Neurology', image: IMAGES.departments.NEUR, head: 'Dr. Derek Shepherd', beds: '14 Beds' },
    { code: 'PEDI', name: 'Pediatrics', image: IMAGES.departments.PEDI, head: 'Dr. Lisa Cuddy', beds: '18 Beds' },
  ];

  const activityColumns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.avatar}
            alt={row.patient}
            className="avatar-img avatar-img-sm"
            style={{ width: '34px', height: '34px' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.patient}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'service', label: 'Service / Procedure' },
    { key: 'doctor', label: 'Attending / Desk' },
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
    { key: 'time', label: 'Timestamp', align: 'right' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Modern Hero Welcome Banner with Staff Picture */}
      <div className="dashboard-welcome-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 2 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={userAvatar}
              alt={user?.name || 'Doctor'}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #0b132b',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="live-pulse-dot" />
              <span style={{ fontSize: '0.8125rem', color: '#7dd3fc', fontWeight: 600 }}>
                CarePulse Live Station • Active Shift
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p style={{ margin: '0.35rem 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
              Hospital telemetry active. 80 Inpatient beds, 7 departments, and clinical EHR running smoothly.
            </p>
          </div>
        </div>

        {/* Quick Action Shortcut Pills */}
        <div className="banner-quick-actions">
          <Link to="/appointments" className="banner-action-btn primary">
            <Calendar size={15} /> Book Slot
          </Link>
          <Link to="/patients" className="banner-action-btn secondary">
            <Users size={15} /> New Patient
          </Link>
          <Link to="/admissions" className="banner-action-btn secondary">
            <Bed size={15} /> Admit Bed
          </Link>
          <button
            className="banner-action-btn secondary"
            onClick={fetchDashboardStats}
            title="Refresh Telemetry"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Modern Progress & Trends */}
      <div className="metrics-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="metric-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div className="metric-icon-wrapper" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
                  <Icon size={22} />
                </div>
                <span className="trend-badge up">
                  <TrendingUp size={12} /> {kpi.trend}
                </span>
              </div>

              <div>
                <div className="metric-val">{kpi.value}</div>
                <div className="metric-label">{kpi.label}</div>
              </div>

              {/* Subtle Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'var(--slate-100)',
                  borderRadius: '2px',
                  marginTop: '0.875rem',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${kpi.progress}%`,
                    height: '100%',
                    backgroundColor: kpi.color,
                    borderRadius: '2px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Visual Showcase with Pictures */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Clinical Departments & Facilities
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Specialized treatment centers, surgical wings, and active capacity
            </p>
          </div>
          <Link to="/departments" className="btn btn-outline btn-sm">
            View All Departments <ArrowUpRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {departmentShowcases.map((dept) => (
            <div
              key={dept.code}
              className="dept-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={dept.image}
                  alt={dept.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.85) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '0.75rem 1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#0284c7', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                      {dept.code}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: '0.25rem 0 0' }}>
                      {dept.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Head: <strong>{dept.head}</strong></span>
                <span className="badge badge-primary">{dept.beds}</span>
              </div>
            </div>
          ))}
        </div>
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
                  <h3 className="card-title">Hospital Clinical Readiness</h3>
                  <p className="card-subtitle">Integrated MERN Micro-services</p>
                </div>
              </div>
              <span className="badge badge-success">Online & Synced</span>
            </div>

            <div className="diagnostic-list">
              <div className="diagnostic-item">
                <span className="diagnostic-label">Registered Medical Specialists</span>
                <span className="diagnostic-value">{kpisData.totalDoctors || 0} Doctors</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Active Clinical & Support Personnel</span>
                <span className="diagnostic-value">{kpisData.totalStaff || 0} Staff</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Automated Pathology & Diagnostics</span>
                <span className="diagnostic-value" style={{ color: 'var(--success-600)' }}>Active</span>
              </div>
              <div className="diagnostic-item">
                <span className="diagnostic-label">Dispensary Stock Deduction</span>
                <span className="diagnostic-value" style={{ color: 'var(--success-600)' }}>Automated</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <Link to="/reports" className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>
              Analytics & Reports
            </Link>
            <Link to="/patients" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
              Manage Patients <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-Time Activities Table with Patient Avatars */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Real-Time Hospital Activities & Clinical Events
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Live stream of appointments, bed admissions, and billing invoices
            </p>
          </div>
        </div>
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
