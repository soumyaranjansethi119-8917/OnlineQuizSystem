import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label fw-semibold text-secondary small mb-1">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`form-select bg-light ${error ? 'is-invalid' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="text-danger small mt-1 d-flex align-items-center"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}
      {!error && helperText && <div className="text-muted small mt-1">{helperText}</div>}
    </div>
  );
};

export default Select;
