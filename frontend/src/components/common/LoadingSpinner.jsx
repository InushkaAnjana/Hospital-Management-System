import React from 'react';
import { Activity } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const spinnerSizes = {
    sm: { width: '18px', height: '18px', borderWidth: '2px' },
    md: { width: '28px', height: '28px', borderWidth: '3px' },
    lg: { width: '40px', height: '40px', borderWidth: '4px' },
  };

  return (
    <div className="loading-container">
      <div className="spinner" style={spinnerSizes[size]} />
      {message && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>}
    </div>
  );
};

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)' }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};

export const PageLoader = ({ message = 'Initializing Hospital Management System...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-app)',
      gap: '1.25rem',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(2, 132, 199, 0.35)',
      }}>
        <Activity size={32} strokeWidth={2.5} />
      </div>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};
