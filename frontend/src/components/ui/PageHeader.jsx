import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({
  title,
  subtitle = '',
  badge = '',
  backLink = null,
  backLabel = 'Back',
  actions = null,
  className = '',
}) => {
  return (
    <div className={`d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 ${className}`}>
      <div>
        {backLink && (
          <Link to={backLink} className="text-secondary text-decoration-none small fw-medium d-inline-flex align-items-center mb-2 hover-primary">
            <i className="bi bi-arrow-left me-1"></i> {backLabel}
          </Link>
        )}
        <div className="d-flex align-items-center gap-2">
          <h2 className="fw-bold text-dark mb-0">{title}</h2>
          {badge && (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 small fw-semibold">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="mt-3 mt-md-0 d-flex gap-2 align-items-center">{actions}</div>}
    </div>
  );
};

export default PageHeader;
