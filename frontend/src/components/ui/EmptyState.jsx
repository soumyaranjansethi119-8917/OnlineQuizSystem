import React from 'react';

const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action = null,
  className = '',
}) => {
  return (
    <div className={`card border-0 shadow-sm rounded-4 p-5 bg-white text-center ${className}`}>
      <div
        className="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mx-auto mb-3"
        style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted small mb-3 max-w-500 mx-auto">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
