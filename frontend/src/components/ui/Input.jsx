import React, { useState } from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  icon = null,
  disabled = false,
  className = '',
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label fw-semibold text-secondary small mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-light border-end-0 text-muted">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={effectiveType}
          className={`form-control bg-light ${icon ? 'border-start-0 ps-1' : ''} ${
            isPasswordField ? 'border-end-0' : ''
          } ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            className="btn btn-light border border-start-0 text-muted px-3"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex="-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        )}
      </div>
      {error && <div className="text-danger small mt-1 d-flex align-items-center"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}
      {!error && helperText && <div className="text-muted small mt-1">{helperText}</div>}
    </div>
  );
};

export default Input;
