import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/NotificationContext';
import { USER_ROLES } from '../utils/constants';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.ADMINISTRATOR);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const rolePresets = [
    { role: USER_ROLES.ADMINISTRATOR, email: 'admin@hospital.org' },
    { role: USER_ROLES.DOCTOR, email: 'dr.smith@hospital.org' },
    { role: USER_ROLES.NURSE, email: 'nurse.sarah@hospital.org' },
    { role: USER_ROLES.RECEPTIONIST, email: 'reception@hospital.org' },
    { role: USER_ROLES.LAB_STAFF, email: 'lab.tech@hospital.org' },
    { role: USER_ROLES.PHARMACIST, email: 'pharmacy@hospital.org' },
    { role: USER_ROLES.ACCOUNTANT, email: 'billing@hospital.org' },
  ];

  const handleRoleQuickPick = (role, demoEmail) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('Admin@12345');
    setErrorMessage('');
    toast.info(`Switched credentials to ${role} demo.`, 'Role Changed');
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
              marginBottom: '1rem',
            }}
          >
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            CarePulse HMS
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Secure Hospital Management Portal Access
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-50)',
              color: 'var(--danger-600)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--danger-light)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="form-group">
            <label className="form-label required">Hospital Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.org"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Mail size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Lock size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Role Tester Pills */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Role Switcher
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              Live DB Users
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.625rem' }}>
            {rolePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`badge ${selectedRole === preset.role ? 'badge-primary' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', padding: '0.35rem 0.65rem', border: 'none' }}
                onClick={() => handleRoleQuickPick(preset.role, preset.email)}
              >
                {preset.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
