import React from 'react';

export default function Textarea({
  value,
  onChange,
  placeholder = '',
  error = '',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`textarea-wrapper ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'field-input error' : 'field-input'}
        style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid var(--outline)' }}
        {...props}
      />
      {error && <span className="error-message" style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
}
