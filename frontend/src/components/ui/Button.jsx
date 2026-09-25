import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'start',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'btn-sm px-3 py-1.5 fs-7',
    md: 'px-4 py-2',
    lg: 'btn-lg px-4 py-2.5 fs-6',
  };

  const variantClass = variant.startsWith('outline-')
    ? `btn-${variant}`
    : variant === 'ghost'
    ? 'btn-link text-decoration-none'
    : `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClasses[size] || sizeClasses.md} rounded-pill fw-semibold d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      )}
      {!loading && icon && iconPosition === 'start' && <span>{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'end' && <span>{icon}</span>}
    </button>
  );
};

export default Button;
