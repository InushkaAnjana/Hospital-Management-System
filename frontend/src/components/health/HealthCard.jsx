import React from 'react';
import { Server, Database, Cpu, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { formatUptime, formatTime } from '../../utils/formatters';
import { useToast } from '../../context/NotificationContext';

export const HealthCard = ({ health, loading, error, lastChecked, onRefresh }) => {
  const toast = useToast();
  const isHealthy = health && health.status === 'UP';
  const isDbHealthy = health?.database?.connected;

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
      toast.success('System health refreshed successfully.', 'Health Check');
    }
  };

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
            <span className="badge badge-warning">Checking…</span>
          ) : isHealthy ? (
            <span className="badge badge-success">API Healthy</span>
          ) : (
            <span className="badge badge-danger">Unreachable</span>
          )}
        </div>
      </div>

      {error ? (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--danger-light)',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          color: 'var(--danger-dark)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}>
          <XCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Connection Failed:</strong> {error}
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.85 }}>
              Ensure the backend server is running on <code style={{ fontFamily: 'monospace' }}>http://localhost:5000</code>
            </div>
          </div>
        </div>
      ) : (
        <div className="diagnostic-list">
          <div className="diagnostic-item">
            <span className="diagnostic-label"><Server size={14} /> API System</span>
            <span className="diagnostic-value">{health?.system || '—'} v{health?.version || '—'}</span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label"><Database size={14} /> MongoDB Atlas</span>
            <span
              className="diagnostic-value"
              style={{ color: isDbHealthy ? 'var(--success-600)' : 'var(--danger-600)' }}
            >
              {isDbHealthy
                ? `Connected (${health?.database?.name})`
                : 'Disconnected'}
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label"><Cpu size={14} /> Memory</span>
            <span className="diagnostic-value">
              {health?.memoryUsageMb
                ? `${health.memoryUsageMb.heapUsed} / ${health.memoryUsageMb.heapTotal} MB`
                : '—'}
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label"><Clock size={14} /> Uptime</span>
            <span className="diagnostic-value">
              {health ? formatUptime(health.uptimeSeconds) : '—'}
            </span>
          </div>

          <div className="diagnostic-item">
            <span className="diagnostic-label"><CheckCircle2 size={14} /> Last Verified</span>
            <span className="diagnostic-value">
              {lastChecked ? formatTime(lastChecked) : 'Just now'}
            </span>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <button
          className="btn btn-primary"
          onClick={handleRefresh}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Pinging…</>
          ) : (
            <><RefreshCw size={14} /> Ping /api/health</>
          )}
        </button>
      </div>
    </div>
  );
};
