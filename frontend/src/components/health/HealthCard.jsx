import React from 'react';
import { Server, Database, Cpu, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatUptime, formatTime } from '../../utils/formatters';

export const HealthCard = ({ health, loading, error, lastChecked, onRefresh }) => {
  const isHealthy = health && health.status === 'UP';
  const isDbHealthy = health?.database?.connected;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title-group">
          <div className={`card-icon-box ${isHealthy ? 'success' : 'warning'}`}>
            <Server size={22} />
          </div>
          <div>
            <h3 className="card-title">Backend API Diagnostics</h3>
            <p className="card-subtitle">GET /api/health</p>
          </div>
        </div>
        <div>
          {loading ? (
            <StatusBadge status="Checking..." variant="warning" />
          ) : isHealthy ? (
            <StatusBadge status="API Healthy" variant="success" />
          ) : (
            <StatusBadge status="Unreachable" variant="danger" />
          )}
        </div>
      </div>

      {error ? (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <XCircle size={18} />
          <div>
            <strong>Connection Failed:</strong> {error}
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Ensure the backend server is running on <code>http://localhost:5000</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="diagnostic-list">
          <div className="diagnostic-item">
            <span className="diagnostic-label">
              <Server size={16} /> API Server
            </span>
            <span className="diagnostic-value">
              {health?.system || 'CarePulse HMS Backend'} (v{health?.version || '1.0.0'})
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label">
              <Database size={16} /> MongoDB Atlas
            </span>
            <span className="diagnostic-value" style={{ color: isDbHealthy ? '#059669' : '#dc2626' }}>
              {isDbHealthy ? `Connected (${health?.database?.name})` : 'Disconnected'}
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label">
              <Cpu size={16} /> Memory Usage
            </span>
            <span className="diagnostic-value">
              {health?.memoryUsageMb ? `${health.memoryUsageMb.heapUsed} MB / ${health.memoryUsageMb.heapTotal} MB` : 'N/A'}
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label">
              <Clock size={16} /> Server Uptime
            </span>
            <span className="diagnostic-value">
              {health ? formatUptime(health.uptimeSeconds) : 'N/A'}
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label">
              <CheckCircle2 size={16} /> Last Verified
            </span>
            <span className="diagnostic-value">
              {lastChecked ? formatTime(lastChecked) : 'Just now'}
            </span>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn btn-primary" 
          onClick={onRefresh} 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Verifying Endpoints...' : 'Ping /api/health Now'}
        </button>
      </div>
    </div>
  );
};
