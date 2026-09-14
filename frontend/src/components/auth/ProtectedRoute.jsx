import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Verifying secure credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return (
      <div style={{ maxWidth: '540px', margin: '4rem auto', padding: '1rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--danger-50)',
              color: 'var(--danger-600)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <ShieldAlert size={30} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Access Restricted
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Your account role (<strong>{user?.role}</strong>) does not have sufficient administrative privileges to access this hospital section.
          </p>
          <div style={{ display: 'inline-flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Roles:</span>
            {allowedRoles.map((r, i) => (
              <span key={i} className="badge badge-primary">{r}</span>
            ))}
          </div>
          <div>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              <ArrowLeft size={14} /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
