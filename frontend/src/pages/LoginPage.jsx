import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle,
  Eye, EyeOff, Sparkles, CheckCircle2, Building2, Stethoscope
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { USER_ROLES } from '../utils/constants';
import { getRoleAvatar, IMAGES } from '../utils/imageAssets';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('admin@hospital.org');
  const [password, setPassword] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.ADMINISTRATOR);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const rolePresets = [
    { role: USER_ROLES.ADMINISTRATOR, name: 'Admin', email: 'admin@hospital.org', desc: 'Full System Control' },
    { role: USER_ROLES.DOCTOR, name: 'Dr. House', email: 'dr.smith@hospital.org', desc: 'Clinical Care & EMR' },
    { role: USER_ROLES.NURSE, name: 'Nurse Sarah', email: 'nurse.sarah@hospital.org', desc: 'Vitals & IPD Wards' },
    { role: USER_ROLES.RECEPTIONIST, name: 'Reception', email: 'reception@hospital.org', desc: 'Admissions & Front Desk' },
    { role: USER_ROLES.LAB_STAFF, name: 'Lab Tech', email: 'lab.tech@hospital.org', desc: 'Diagnostics & Pathology' },
    { role: USER_ROLES.PHARMACIST, name: 'Pharmacy', email: 'pharmacy@hospital.org', desc: 'Inventory & Dispensing' },
    { role: USER_ROLES.ACCOUNTANT, name: 'Billing', email: 'billing@hospital.org', desc: 'Invoices & Finance' },
  ];

  const handleRoleQuickPick = (preset) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword('Admin@12345');
    setErrorMessage('');
    toast.info(`Switched credentials to ${preset.role} demo.`, 'Demo Switch');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}! Authenticated as ${user.role}.`, 'Login Successful');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password credentials.';
      setErrorMessage(msg);
      toast.error(msg, 'Authentication Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Visual Brand Side with Hospital Photography */}
      <div className="login-brand-side">
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <Activity size={28} strokeWidth={2.8} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              CarePulse Health
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#7dd3fc', fontWeight: 600, letterSpacing: '0.04em' }}>
              CLINICAL INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>

        <div className="login-hero-content">
          <div className="login-hero-pill">
            <Sparkles size={14} color="#38bdf8" />
            <span>Next-Generation Healthcare Operating System</span>
          </div>

          <h2 className="login-hero-title">
            Intelligent Care, <span>Seamless Operations.</span>
          </h2>

          <p className="login-hero-desc">
            Empowering medical specialists, nursing staff, laboratory technicians, and administrators
            with unified electronic medical records, real-time bed telemetry, and clinical workflows.
          </p>

          {/* Telemetry Glass Cards */}
          <div className="login-telemetry-grid">
            <div className="login-telemetry-card">
              <div className="login-telemetry-val">99.8%</div>
              <div className="login-telemetry-label">System Uptime</div>
            </div>
            <div className="login-telemetry-card">
              <div className="login-telemetry-val">80 Beds</div>
              <div className="login-telemetry-label">Live Telemetry</div>
            </div>
            <div className="login-telemetry-card">
              <div className="login-telemetry-val">&lt; 150ms</div>
              <div className="login-telemetry-label">API Latency</div>
            </div>
          </div>
        </div>

        <div className="login-brand-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span>HIPAA-Compliant • 256-Bit SSL Encryption • JCI Ready</span>
          </div>
          <div>CarePulse v2.0</div>
        </div>
      </div>

      {/* Form Side */}
      <div className="login-form-side">
        <div className="login-form-wrapper">
          {/* Form Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
              <Building2 size={16} /> Hospital Staff Portal
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Sign In to Your Station
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Select a staff role below for one-click demo login, or enter your credentials.
            </p>
          </div>

          {/* Quick-Pick Role Selector Carousel */}
          <div>
            <div className="role-selector-label">
              <span>Quick Demo Roles (1-Click Fill)</span>
              <span style={{ color: 'var(--primary-600)', fontSize: '0.75rem' }}>Click to Autofill</span>
            </div>
            <div className="role-selector-grid">
              {rolePresets.map((preset) => {
                const isActive = selectedRole === preset.role;
                const avatar = getRoleAvatar(preset.role);
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleRoleQuickPick(preset)}
                    className={`role-selector-pill ${isActive ? 'active' : ''}`}
                    title={preset.desc}
                  >
                    <img src={avatar} alt={preset.name} />
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--danger-50)',
                border: '1px solid var(--danger-light)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger-dark)',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} color="var(--danger-600)" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Staff Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. admin@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                  Demo: Admin@12345
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--slate-400)',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9375rem',
                padding: '0.875rem',
              }}
            >
              {submitting ? (
                <>
                  <span className="spin-anim">⏳</span>
                  <span>Authenticating Station...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {rolePresets.find((r) => r.role === selectedRole)?.name || 'Staff'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Help Banner */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} color="var(--success-600)" />
              Ready for Multi-Role Clinical Evaluation
            </div>
            <div>
              Click any role pill above to test granular access permissions across Doctor, Nurse, Laboratory, Pharmacy, and Reception modules.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
