import React from 'react';

const Alert = ({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon,
  ...props
}) => {
  const iconMap = {
    info: 'bi-info-circle-fill',
    success: 'bi-check-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    danger: 'bi-exclamation-octagon-fill',
  };

  const selectedIcon = icon || <i className={`bi ${iconMap[variant] || 'bi-info-circle-fill'} fs-5 me-2`}></i>;

  return (
    <div
      className={`alert alert-${variant} d-flex align-items-center rounded-3 p-3 shadow-xs ${
        dismissible ? 'alert-dismissible' : ''
      } ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 d-flex align-items-center">{selectedIcon}</div>
      <div className="flex-grow-1 small fw-medium">{children}</div>
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};

export default Alert;
