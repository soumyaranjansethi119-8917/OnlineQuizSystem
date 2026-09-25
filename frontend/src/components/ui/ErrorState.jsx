import React from 'react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`card border-0 shadow-sm rounded-4 p-5 bg-white text-center ${className}`}>
      <div
        className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mx-auto mb-3"
        style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
      >
        <i className="bi bi-exclamation-triangle"></i>
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted small mb-3 max-w-500 mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-2">
          <Button variant="outline-primary" size="sm" onClick={onRetry} icon={<i className="bi bi-arrow-clockwise"></i>}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
