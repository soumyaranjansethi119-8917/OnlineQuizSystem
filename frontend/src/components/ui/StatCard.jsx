import React from 'react';

const StatCard = ({
  label,
  value,
  icon,
  variant = 'primary',
  subtext = '',
  className = '',
}) => {
  const variantIcons = {
    primary: 'bg-primary-subtle text-primary',
    success: 'bg-success-subtle text-success',
    warning: 'bg-warning-subtle text-warning',
    danger: 'bg-danger-subtle text-danger',
    info: 'bg-info-subtle text-info',
    secondary: 'bg-light text-secondary',
  };

  return (
    <div className={`card border-0 shadow-sm rounded-4 p-3 bg-white h-100 ${className}`}>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="text-muted small fw-medium">{label}</div>
          <h3 className="fw-bold text-dark mb-0 mt-1">{value}</h3>
          {subtext && <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>{subtext}</div>}
        </div>
        <div className={`rounded-3 p-3 fs-4 ${variantIcons[variant] || variantIcons.primary}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
