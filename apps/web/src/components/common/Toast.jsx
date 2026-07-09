import React, { useEffect } from 'react';

export default function Toast({
  message,
  tone = 'info', // info, success, danger
  onClose,
  duration = 3000
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getStyle = () => {
    switch (tone) {
      case 'success':
        return { background: 'var(--ok-bg)', color: 'var(--ok)', borderColor: 'var(--ok)' };
      case 'danger':
        return { background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger)' };
      case 'info':
      default:
        return { background: '#eef1f4', color: 'var(--text)', borderColor: 'var(--outline)' };
    }
  };

  return (
    <div
      className={`notice toast-${tone}`}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        borderLeft: '4px solid',
        ...getStyle()
      }}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 0,
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '0 4px'
        }}
      >
        &times;
      </button>
    </div>
  );
}
