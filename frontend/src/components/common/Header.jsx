import React from 'react';
import { Activity, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export const Header = ({ isConnected, isDbConnected, onRefresh, loading }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>CarePulse HMS</h1>
            <span>Hospital Management System</span>
          </div>
        </div>

        <div className="navbar-nav">
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span>{isConnected ? 'Backend Live' : 'Backend Offline'}</span>
          </div>

          <div className={`status-indicator ${isDbConnected ? 'online' : 'offline'}`}>
            <Database size={14} />
            <span>{isDbConnected ? 'Atlas DB Connected' : 'DB Disconnected'}</span>
          </div>

          <button 
            className="btn btn-outline" 
            onClick={onRefresh} 
            disabled={loading}
            title="Refresh System Health"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            <span>Check</span>
          </button>
        </div>
      </div>
    </header>
  );
};
