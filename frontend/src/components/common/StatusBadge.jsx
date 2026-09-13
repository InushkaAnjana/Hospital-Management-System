import React from 'react';

export const StatusBadge = ({ status, variant = 'primary' }) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'success':
        return 'badge badge-success';
      case 'warning':
        return 'badge badge-warning';
      case 'danger':
        return 'badge badge-danger';
      default:
        return 'badge badge-primary';
    }
  };

  return <span className={getBadgeClass()}>{status}</span>;
};
