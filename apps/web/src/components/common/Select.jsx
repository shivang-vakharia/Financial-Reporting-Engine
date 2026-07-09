import React from 'react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  error = '',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`select-wrapper ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? 'field-input error' : 'field-input'}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--outline)', background: 'var(--surface-lowest)' }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message" style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
}
