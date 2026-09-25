import React from 'react';

export const SkeletonText = ({ width = '100%', height = '14px', className = '' }) => (
  <span
    className={`skeleton-box d-block ${className}`}
    style={{ width, height, borderRadius: '4px' }}
  ></span>
);

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="col-lg-4 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <SkeletonText width="60px" height="20px" />
              <SkeletonText width="50px" height="16px" />
            </div>
            <SkeletonText width="80%" height="22px" className="mb-2" />
            <SkeletonText width="100%" height="14px" className="mb-1" />
            <SkeletonText width="65%" height="14px" className="mb-4" />
            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
              <SkeletonText width="70px" height="16px" />
              <SkeletonText width="90px" height="34px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <SkeletonText width="70%" height="14px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <SkeletonText width={c === 0 ? '90%' : '60%'} height="16px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default {
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
};
