import React from 'react';

export default function Input({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error = '',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`input-wrapper ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'field-input error' : 'field-input'}
        {...props}
      />
      {error && <span className="error-message" style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
}
