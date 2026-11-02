import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users, Stethoscope, Building2, Calendar,
  FileText, FlaskConical, Pill, Receipt,
  Bed, ShieldCheck, BarChart3, Database, CheckCircle, Clock,
  ArrowRight, Sparkles, HeartPulse, Activity
} from 'lucide-react';
import { HealthCard } from '../components/health/HealthCard';
import { IMAGES } from '../utils/imageAssets';

export const HomePage = () => {
  const { health, loading, refetch } = useOutletContext();

  const modules = [
    { title: 'Authentication & 7 Roles', icon: <ShieldCheck size={20} />, desc: 'Admin, Doctor, Nurse, Receptionist, Lab, Pharmacy, Accountant', status: 'Operational', image: IMAGES.roles.Doctor },
    { title: 'Patient Registry', icon: <Users size={20} />, desc: 'Demographics, clinical timeline, blood group, emergency contact', status: 'Operational', image: IMAGES.patients[0] },
    { title: 'Doctor & Department Directory', icon: <Stethoscope size={20} />, desc: 'Specialist roster, weekly OPD clinic timings, fees & quotas', status: 'Operational', image: IMAGES.doctors[0] },
    { title: 'Appointment Scheduling', icon: <Calendar size={20} />, desc: 'Conflict-free slot booking, patient queues & status updates', status: 'Operational', image: IMAGES.hospitalInterior },
    { title: 'Inpatient (IPD) & Bed Matrix', icon: <Bed size={20} />, desc: '80 Beds across General, ICU, CCU & Private with vitals tracking', status: 'Operational', image: IMAGES.departments.ICU },
    { title: 'EMR & Digital Prescriptions', icon: <FileText size={20} />, desc: 'Diagnoses, ICD-10 symptoms, auto dosage calculator', status: 'Operational', image: IMAGES.hospitalCorridor },
    { title: 'Laboratory Diagnostics', icon: <FlaskConical size={20} />, desc: 'Test catalog, sample accession, pathology verification', status: 'Operational', image: IMAGES.departments.LAB },
    { title: 'Pharmacy Inventory', icon: <Pill size={20} />, desc: 'Batch control, expiry monitors, automated dispensing', status: 'Operational', image: IMAGES.departments.PHARM },
    { title: 'Billing & Finance Invoicing', icon: <Receipt size={20} />, desc: 'Consolidated service charges, tax calculation & receipts', status: 'Operational', image: IMAGES.departments.CARD },
    { title: 'Clinical Staff HR', icon: <Building2 size={20} />, desc: 'Shift scheduling, attendance tracking & department assignments', status: 'Operational', image: IMAGES.roles.Nurse },
    { title: 'Executive Reports', icon: <BarChart3 size={20} />, desc: 'Interactive revenue analytics and clinical workload charts', status: 'Operational', image: IMAGES.departments.SURG },
    { title: 'Database & Cloud Snapshots', icon: <Database size={20} />, desc: 'MongoDB Atlas high-availability M0 shard telemetry', status: 'Operational', image: IMAGES.hospitalModern },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Modern Hero Section with Visual Image Overlay */}
      <section
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: `linear-gradient(135deg, rgba(11, 19, 43, 0.95) 0%, rgba(2, 132, 199, 0.88) 100%), url(${IMAGES.hospitalHero}) center/cover no-repeat`,
          color: 'white',
          padding: '3.5rem 3rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ maxWidth: '720px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
            }}
          >
            <span className="live-pulse-dot" style={{ width: '7px', height: '7px' }} />
            <span>CarePulse HMS Cloud Enterprise Platform</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', margin: 0 }}>
            Unified Clinical Intelligence & <span style={{ color: '#38bdf8' }}>Hospital Operations</span>
          </h1>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.85)', margin: '1.25rem 0 2rem' }}>
            Full-stack MERN enterprise architecture built with Node.js, Express, React 19, Vite,
            MongoDB Atlas, JWT role-based access control, and real-time medical workflows.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              className="btn btn-primary btn-lg"
              style={{
                background: '#0ea5e9',
                boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Enter Live Dashboard <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="btn btn-outline btn-lg"
              style={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              Staff Station Login
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Live Health & Stack Highlights */}
      <div className="dashboard-grid">
        <HealthCard
          health={health}
          loading={loading}
          onRefresh={refetch}
        />

        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-box success">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="card-title">Production Health & Infrastructure</h3>
                <p className="card-subtitle">Verified & Operational</p>
              </div>
            </div>
            <span className="badge badge-success">Live Ready</span>
          </div>

          <div className="diagnostic-list">
            <div className="diagnostic-item">
              <span className="diagnostic-label">Frontend Stack</span>
              <span className="diagnostic-value">React 19 + Vite 8 + Modern UI</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Backend Server</span>
              <span className="diagnostic-value">Express 5 (Node v22.17)</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Database Cluster</span>
              <span className="diagnostic-value">MongoDB Atlas (Live Cloud)</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Security & Auth</span>
              <span className="diagnostic-value">JWT Bearer + 7 Roles RBAC</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Clinical Modules</span>
              <span className="diagnostic-value" style={{ color: 'var(--success-600)' }}>12 Active Suites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Visual Grid with Pictures */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Integrated Hospital Management Modules
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              Comprehensive clinical workflow suites ready for healthcare professionals
            </p>
          </div>
        </div>

        <div className="modules-grid">
          {modules.map((mod, index) => (
            <div
              key={index}
              className="module-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mod.icon}
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  {mod.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {mod.title}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {mod.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
