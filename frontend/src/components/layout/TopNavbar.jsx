import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Database, Shield, LogOut, User } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const TopNavbar = ({ onOpenMobile, isConnected, isDbConnected }) => {
  const { toast } = useNotification();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNotificationClick = () => {
    toast.info('System operational: All hospital clinical services are running smoothly.', 'Hospital Broadcast');
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    toast.info('Session ended. You have been logged out.');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
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
            <span>{user?.role || 'Guest'}</span>
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
            <span>{isDbConnected ? 'Atlas Live' : 'DB Offline'}</span>
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
              background: 'none',
              border: 'none',
              cursor: 'pointer',
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
              {getInitials(user?.name)}
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '220px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '0.5rem',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.25rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name || 'CarePulse User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <div style={{ marginTop: '0.25rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--danger-600)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={handleLogout}
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
