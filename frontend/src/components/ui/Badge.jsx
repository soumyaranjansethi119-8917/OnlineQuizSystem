import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary-subtle text-primary border border-primary-subtle',
    success: 'bg-success-subtle text-success border border-success-subtle',
    danger: 'bg-danger-subtle text-danger border border-danger-subtle',
    warning: 'bg-warning-subtle text-dark border border-warning-subtle',
    info: 'bg-info-subtle text-info border border-info-subtle',
    secondary: 'bg-light text-secondary border border-secondary-subtle',
    dark: 'bg-dark text-white',
  };

  const dotColors = {
    primary: 'bg-primary',
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
    secondary: 'bg-secondary',
    dark: 'bg-light',
  };

  return (
    <span
      className={`badge rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1.5 ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`rounded-circle ${dotColors[variant] || 'bg-primary'}`}
          style={{ width: '6px', height: '6px' }}
        ></span>
      )}
      {children}
    </span>
  );
};

export default Badge;
