import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Users, UserPlus, Building2,
  Calendar, FileText, FlaskConical, Pill, Receipt,
  Bed, ShieldCheck, BarChart3, ChevronLeft, ChevronRight, Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

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
        { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Administrator', 'Accountant', 'Doctor', 'Pharmacist', 'Laboratory Staff', 'Receptionist'] },
        { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, roles: ['Administrator'] },
      ],
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div>
              <div className="sidebar-brand-title">CarePulse</div>
              <div className="sidebar-brand-badge">Hospital System</div>
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
          // Filter items based on user role
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

      {/* Footer Profile Preview */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            {getInitials(user?.name)}
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Hospital Admin'}</div>
              <div className="sidebar-user-role">{user?.role || 'Administrator'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
