import React from 'react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
}) => {
  return (
    <div className={`input-group ${className}`}>
      <span className="input-group-text bg-light border-end-0 text-muted">
        <i className="bi bi-search"></i>
      </span>
      <input
        type="text"
        className="form-control border-start-0 border-end-0 bg-light"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="btn btn-light border-start-0 text-muted"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          aria-label="Clear search"
        >
          <i className="bi bi-x-circle-fill"></i>
        </button>
      ) : (
        <span className="input-group-text bg-light border-start-0"></span>
      )}
    </div>
  );
};

export default SearchBar;
