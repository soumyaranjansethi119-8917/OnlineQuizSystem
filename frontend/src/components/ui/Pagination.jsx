import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis if needed
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pt-3 border-top mt-4 ${className}`}>
      {totalItems > 0 && (
        <div className="text-muted small">
          Showing <span className="fw-semibold text-dark">{startItem}</span> to{' '}
          <span className="fw-semibold text-dark">{endItem}</span> of{' '}
          <span className="fw-semibold text-dark">{totalItems}</span> results
        </div>
      )}
      <nav aria-label="Page navigation">
        <ul className="pagination pagination-sm mb-0 gap-1">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link rounded-pill px-3 border-0 bg-light text-dark fw-semibold"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous"
            >
              <i className="bi bi-chevron-left me-1"></i> Prev
            </button>
          </li>
          {getPages().map((page, index) =>
            page === '...' ? (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link border-0 bg-transparent text-muted">...</span>
              </li>
            ) : (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button
                  className={`page-link rounded-circle border-0 fw-semibold d-flex align-items-center justify-content-center ${
                    currentPage === page ? 'bg-primary text-white' : 'bg-light text-dark'
                  }`}
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            )
          )}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link rounded-pill px-3 border-0 bg-light text-dark fw-semibold"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next"
            >
              Next <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
