import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs = [],
  badge = null,
  actions = null,
}) => {
  return (
    <div className="page-header">
      <div className="page-header-title-group">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-header-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight size={13} />
                {crumb.path ? (
                  <Link to={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <h1 className="page-header-title">
            {Icon && <Icon size={26} color="var(--primary-600)" />}
            {title}
          </h1>
          {badge && <span className="badge badge-primary">{badge}</span>}
        </div>

        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
