import React from 'react';

export default function EmptyState({
  message,
  icon,
  className = '',
  ...props
}) {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        textAlign: 'center',
        background: 'var(--surface-lowest)',
        border: '1px dashed var(--outline)',
        borderRadius: '8px'
      }}
      {...props}
    >
      {icon && <div style={{ fontSize: '32px', marginBottom: '12px', color: 'var(--outline)' }}>{icon}</div>}
      <p className="muted" style={{ margin: 0, fontSize: '14px' }}>{message}</p>
    </div>
  );
}
