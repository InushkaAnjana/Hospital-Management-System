import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Users, UserPlus, Building2,
  Calendar, FileText, FlaskConical, Pill, Receipt,
  Bed, ShieldCheck, BarChart3, ChevronLeft, ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
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
        { label: 'Patients', path: '/patients', icon: Users },
        { label: 'Appointments', path: '/appointments', icon: Calendar },
        { label: 'Medical Records', path: '/medical-records', icon: FileText },
        { label: 'Inpatient (IPD)', path: '/admissions', icon: Bed },
      ],
    },
    {
      title: 'Diagnostics & Drugs',
      items: [
        { label: 'Laboratory', path: '/laboratory', icon: FlaskConical },
        { label: 'Pharmacy', path: '/pharmacy', icon: Pill },
      ],
    },
    {
      title: 'Hospital Operations',
      items: [
        { label: 'Doctors', path: '/doctors', icon: Activity },
        { label: 'Departments', path: '/departments', icon: Building2 },
        { label: 'Billing & Invoices', path: '/billing', icon: Receipt },
        { label: 'Staff Management', path: '/staff', icon: UserPlus },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
        { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
      ],
    },
  ];

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
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="sidebar-section">
            {!isCollapsed && (
              <span className="sidebar-section-title">{section.title}</span>
            )}
            {section.items.map((item, iIdx) => {
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
        ))}
      </div>

      {/* Footer Profile Preview */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            AD
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Hospital Admin</div>
              <div className="sidebar-user-role">Super Administrator</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
