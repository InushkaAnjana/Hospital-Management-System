import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, Database, Shield, LogOut, User,
  CheckCircle, AlertTriangle, Clock, Activity, ChevronDown
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { getRoleAvatar } from '../../utils/imageAssets';

export const TopNavbar = ({ onOpenMobile, isConnected, isDbConnected }) => {
  const { toast } = useNotification();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const avatarUrl = getRoleAvatar(user?.role);

  const notifications = [
    {
      id: 1,
      title: 'Stat Lab Panel Ready',
      desc: 'Blood biochemistry results for Patient John Doe (PT-1001) verified.',
      time: '5m ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'ICU Bed Allocated',
      desc: 'Bed ICU-02 successfully assigned to new admission.',
      time: '18m ago',
      type: 'success',
    },
    {
      id: 3,
      title: 'Shift Handover Alert',
      desc: 'Nurse shift 08:00 - 16:00 roster confirmed for all wards.',
      time: '1h ago',
      type: 'warning',
    },
  ];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    toast.info('Session ended. You have been logged out.');
    navigate('/login');
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

        <div className="topbar-search-box" style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--slate-400)" />
          <input
            type="text"
            placeholder="Search patient, doctor, record..."
            aria-label="Universal Search"
            style={{ width: '100%', paddingRight: '48px' }}
          />
          <span
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: 'var(--slate-200)',
              color: 'var(--slate-600)',
              padding: '2px 6px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}
          >
            Ctrl K
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* System Telemetry & Role Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            className="topbar-role-pill"
            style={{
              backgroundColor: isDbConnected ? '#ecfdf5' : '#fef2f2',
              borderColor: isDbConnected ? '#a7f3d0' : '#fecaca',
              color: isDbConnected ? '#065f46' : '#991b1b',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isDbConnected ? 'MongoDB Atlas Cluster connected & synchronized' : 'Database Offline'}
          >
            <span
              className={isDbConnected ? 'live-pulse-dot' : ''}
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: isDbConnected ? '#10b981' : '#ef4444',
                borderRadius: '50%',
              }}
            />
            <Database size={13} />
            <span>{isDbConnected ? 'Atlas Cloud M0' : 'DB Offline'}</span>
          </div>

          <div className="topbar-role-pill" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Shield size={13} color="var(--primary-600)" />
            <span style={{ fontWeight: 600 }}>{user?.role || 'Guest'}</span>
          </div>
        </div>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            title="Hospital Notifications"
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="topbar-badge-dot"></span>
          </button>

          {showNotifications && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--slate-50)',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Clinical Alerts</div>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {notifications.length} New
                </span>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--slate-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '0.625rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--slate-50)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)' }}
                  onClick={() => {
                    setShowNotifications(false);
                    toast.info('All notifications marked as reviewed.');
                  }}
                >
                  Mark All Reviewed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--slate-100)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            aria-label="User profile menu"
          >
            <img
              src={avatarUrl}
              alt={user?.name || 'User'}
              className="avatar-img avatar-img-sm"
              style={{ width: '28px', height: '28px' }}
            />
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                maxWidth: '120px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={14} color="var(--slate-500)" />
          </button>

          {showProfileMenu && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '240px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.75rem',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.5rem',
                }}
              >
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="avatar-img"
                  style={{ width: '42px', height: '42px', borderRadius: '12px' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.name || 'CarePulse User'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.email}
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--danger-600)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={handleLogout}
              >
                <LogOut size={15} /> Sign Out of CarePulse
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
