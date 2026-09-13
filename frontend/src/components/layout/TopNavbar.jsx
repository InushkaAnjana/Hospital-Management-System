import React, { useState } from 'react';
import { Menu, Search, Bell, Database, Shield, LogOut, CheckCircle2, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const TopNavbar = ({ onOpenMobile, isConnected, isDbConnected }) => {
  const { toast } = useNotification();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNotificationClick = () => {
    toast.info('System operational: All clinical services are running smoothly.', 'Hospital Broadcast');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-icon-btn"
          onClick={onOpenMobile}
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="topbar-search-box">
          <Search size={16} color="var(--slate-400)" />
          <input
            type="text"
            placeholder="Search patient, doctor, record..."
            aria-label="Universal Search"
          />
        </div>
      </div>

      <div className="topbar-right">
        {/* Connection Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div className="topbar-role-pill">
            <Shield size={13} />
            <span>Administrator</span>
          </div>

          <div
            className="topbar-role-pill"
            style={{
              backgroundColor: isDbConnected ? 'var(--success-50)' : 'var(--danger-50)',
              borderColor: isDbConnected ? 'var(--success-light)' : 'var(--danger-light)',
              color: isDbConnected ? 'var(--success-dark)' : 'var(--danger-dark)',
            }}
            title={isDbConnected ? 'MongoDB Atlas Cluster Connected' : 'Database Offline'}
          >
            <Database size={13} />
            <span>{isDbConnected ? 'Atlas Live' : 'DB Disconnected'}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          className="topbar-icon-btn"
          onClick={handleNotificationClick}
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="topbar-badge-dot"></span>
        </button>

        {/* User Profile Avatar with dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)',
            }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="User profile menu"
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-600)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              <User size={18} />
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '200px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '0.5rem',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Admin User</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@hospital.org</div>
              </div>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.45rem 0.5rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--danger-600)',
                }}
                onClick={() => {
                  setShowProfileMenu(false);
                  toast.info('Logged out from current session.');
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
