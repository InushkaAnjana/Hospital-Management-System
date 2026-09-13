import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
      <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The requested page could not be located.</p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Return to Home
      </Link>
    </div>
  );
};
