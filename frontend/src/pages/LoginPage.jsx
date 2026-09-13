import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useToast } from '../context/NotificationContext';
import { USER_ROLES } from '../utils/constants';

export const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('admin@hospital.org');
  const [password, setPassword] = useState('Admin@12345');
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.ADMINISTRATOR);
  const [submitting, setSubmitting] = useState(false);

  const handleRoleQuickPick = (role, demoEmail) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    toast.info(`Switched credentials to ${role} demo.`, 'Role Changed');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Welcome back! Authenticated as ${selectedRole}.`, 'Login Successful');
      navigate('/dashboard');
    }, 400);
  };

  const rolePresets = [
    { role: USER_ROLES.ADMINISTRATOR, email: 'admin@hospital.org' },
    { role: USER_ROLES.DOCTOR, email: 'dr.smith@hospital.org' },
    { role: USER_ROLES.NURSE, email: 'nurse.sarah@hospital.org' },
    { role: USER_ROLES.RECEPTIONIST, email: 'reception@hospital.org' },
    { role: USER_ROLES.PHARMACIST, email: 'pharmacy@hospital.org' },
    { role: USER_ROLES.LAB_STAFF, email: 'lab.tech@hospital.org' },
    { role: USER_ROLES.ACCOUNTANT, email: 'billing@hospital.org' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem',
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-subtle)',
        padding: '2.5rem 2rem',
      }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
            marginBottom: '1rem',
          }}>
            <Activity size={30} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            CarePulse HMS
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Hospital Management System Authentication
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="form-group">
            <label className="form-label required">Hospital Email / Username</label>
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
            {submitting ? 'Verifying Credentials...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Role Tester Pills */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Role Switcher (Preview)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
            {rolePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className={`badge ${selectedRole === preset.role ? 'badge-primary' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', padding: '0.3rem 0.6rem' }}
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
