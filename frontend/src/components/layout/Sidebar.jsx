import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Users, UserPlus, Building2,
  Calendar, FileText, FlaskConical, Pill, Receipt,
  Bed, ShieldCheck, BarChart3, ChevronLeft, ChevronRight, Stethoscope,
  UserCheck, HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRoleAvatar } from '../../utils/imageAssets';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const avatarUrl = getRoleAvatar(user?.role);

  const navSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Clinical Services',
      items: [
        { label: 'Patients', path: '/patients', icon: Users, roles: ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant'] },
        { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['Administrator', 'Doctor', 'Nurse', 'Receptionist'] },
        { label: 'Medical Records', path: '/medical-records', icon: FileText, roles: ['Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'] },
        { label: 'Prescriptions', path: '/prescriptions', icon: Pill, roles: ['Administrator', 'Doctor', 'Nurse', 'Pharmacist'] },
        { label: 'Inpatient (IPD)', path: '/admissions', icon: Bed, roles: ['Administrator', 'Doctor', 'Nurse'] },
      ],
    },
    {
      title: 'Diagnostics & Drugs',
      items: [
        { label: 'Laboratory', path: '/laboratory', icon: FlaskConical, roles: ['Administrator', 'Laboratory Staff', 'Doctor'] },
        { label: 'Pharmacy', path: '/pharmacy', icon: Pill, roles: ['Administrator', 'Pharmacist', 'Doctor'] },
      ],
    },
    {
      title: 'Hospital Operations',
      items: [
        { label: 'Doctors', path: '/doctors', icon: Stethoscope, roles: ['Administrator', 'Doctor', 'Receptionist', 'Nurse'] },
        { label: 'Departments', path: '/departments', icon: Building2, roles: ['Administrator', 'Doctor', 'Receptionist'] },
        { label: 'Billing & Invoices', path: '/billing', icon: Receipt, roles: ['Administrator', 'Accountant', 'Receptionist'] },
        { label: 'Staff Management', path: '/staff', icon: UserPlus, roles: ['Administrator'] },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'User Provisioning', path: '/users', icon: UserCheck, roles: ['Administrator'] },
        { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Administrator'] },
        { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, roles: ['Administrator'] },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ position: 'relative' }}>
            <Activity size={22} strokeWidth={2.5} />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
            />
          </div>
          {!isCollapsed && (
            <div>
              <div className="sidebar-brand-title">CarePulse</div>
              <div className="sidebar-brand-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="live-pulse-dot" style={{ width: '5px', height: '5px' }} /> HMS Cloud OS
              </div>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="sidebar-nav-container">
        {navSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || (user && (user.role === 'Administrator' || item.roles.includes(user.role)))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="sidebar-section">
              {!isCollapsed && (
                <span className="sidebar-section-title">{section.title}</span>
              )}
              {visibleItems.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : ''}
                  >
                    <div className="sidebar-nav-icon">
                      <Icon size={18} />
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Profile Preview with Picture */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt={user?.name || 'User'}
              className="avatar-img avatar-img-sm"
              style={{ width: '38px', height: '38px', borderRadius: '10px' }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #0f172a',
              }}
              title="Online"
            />
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
              <div
                className="sidebar-user-name"
                style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {user?.name || 'Hospital Staff'}
              </div>
              <div
                className="sidebar-user-role"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary-400)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.role || 'Administrator'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
