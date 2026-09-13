import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, Stethoscope, Building2, Calendar, 
  FileText, FlaskConical, Pill, Receipt, 
  Bed, ShieldCheck, BarChart3, Database, CheckCircle, Clock
} from 'lucide-react';
import { HealthCard } from '../components/health/HealthCard';

export const HomePage = () => {
  const { health, loading, refetch } = useOutletContext();

  const modules = [
    { title: 'Authentication & RBAC', icon: <ShieldCheck size={20} />, desc: '7 Roles: Admin, Doctor, Nurse, Receptionist, Lab, Pharmacy, Accountant', status: 'Phase 2' },
    { title: 'Patient Management', icon: <Users size={20} />, desc: 'Registration, demographics, medical history timeline & records', status: 'Phase 2' },
    { title: 'Doctor & Department', icon: <Stethoscope size={20} />, desc: 'Doctor profiles, specialties, schedules & slot quotas', status: 'Phase 2' },
    { title: 'Appointment Scheduling', icon: <Calendar size={20} />, desc: 'Conflict-free slot booking, queue status & doctor calendar', status: 'Phase 2' },
    { title: 'Inpatient (IPD) & Beds', icon: <Bed size={20} />, desc: 'Wards, bed occupancy matrix, daily nurse vitals & discharge', status: 'Phase 3' },
    { title: 'EMR & Prescriptions', icon: <FileText size={20} />, desc: 'Clinical diagnosis, symptoms, prescription builder', status: 'Phase 4' },
    { title: 'Laboratory Management', icon: <FlaskConical size={20} />, desc: 'Test catalog, sample collection, technician result entry', status: 'Phase 4' },
    { title: 'Pharmacy Inventory', icon: <Pill size={20} />, desc: 'Batch tracking, expiry warnings, automatic dispensing', status: 'Phase 5' },
    { title: 'Billing & Payments', icon: <Receipt size={20} />, desc: 'Consolidated service invoicing, payment receipt printing', status: 'Phase 6' },
    { title: 'Staff & HR Attendance', icon: <Building2 size={20} />, desc: 'Employee check-in/out, leave approvals, department mapping', status: 'Phase 7' },
    { title: 'Reports & Analytics', icon: <BarChart3 size={20} />, desc: 'Interactive Recharts dashboards for revenue & patient volume', status: 'Phase 8' },
    { title: 'Backup & Recovery', icon: <Database size={20} />, desc: 'Automated mongodump snapshots & disaster recovery scripts', status: 'Phase 9' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <CheckCircle size={14} /> Phase 1: Project Initialization Complete
        </div>
        <h1 className="hero-title">
          Modern <span>Hospital Management</span> System
        </h1>
        <p className="hero-subtitle">
          Full-stack MERN enterprise architecture built with Node.js, Express, React, Vite, 
          MongoDB Atlas, JWT role-based security, and Recharts analytics.
        </p>
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
                <h3 className="card-title">Phase 1 Architecture Status</h3>
                <p className="card-subtitle">Verified & operational</p>
              </div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>

          <div className="diagnostic-list">
            <div className="diagnostic-item">
              <span className="diagnostic-label">Frontend Framework</span>
              <span className="diagnostic-value">React 19 + Vite (JavaScript)</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Backend Server</span>
              <span className="diagnostic-value">Express.js (Node v22)</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Database Cluster</span>
              <span className="diagnostic-value">MongoDB Atlas (Cloud M0/M10)</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">API Client</span>
              <span className="diagnostic-value">Axios + JWT Interceptor</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Client Router</span>
              <span className="diagnostic-value">React Router v7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Roadmap Grid */}
      <div>
        <h2 className="modules-preview-title">
          <Building2 size={20} color="#0284c7" />
          Specification Modules (Ready for Implementation)
        </h2>
        <div className="modules-grid">
          {modules.map((mod, index) => (
            <div key={index} className="module-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ color: '#0284c7' }}>{mod.icon}</div>
                <span className="badge badge-primary">{mod.status}</span>
              </div>
              <h4>{mod.title}</h4>
              <p>{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
