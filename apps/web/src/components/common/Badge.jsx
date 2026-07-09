import React from 'react';

export default function Badge({
  children,
  tone = 'info', // info, success, danger, warning
  className = '',
  ...props
}) {
  const getStyle = () => {
    switch (tone) {
      case 'success':
        return { background: 'var(--ok-bg)', color: 'var(--ok)' };
      case 'danger':
        return { background: 'var(--danger-bg)', color: 'var(--danger)' };
      case 'warning':
        return { background: '#fff3cd', color: '#856404' };
      case 'processing':
        return { background: '#dbe1ff', color: '#003ea8' };
      case 'info':
      default:
        return { background: '#f2f4f6', color: 'var(--muted)' };
    }
  };

  return (
    <span
      className={`status-chip ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        ...getStyle()
      }}
      {...props}
    >
      {children}
    </span>
  );
}
