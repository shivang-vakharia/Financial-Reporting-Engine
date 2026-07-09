import React from 'react';

export default function Spinner({
  size = 18,
  className = '',
  ...props
}) {
  return (
    <div
      className={`loading-spinner-wrapper ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      {...props}
    >
      <span
        className="loading-spinner"
        style={{
          width: size,
          height: size,
          border: '2px solid rgba(0,0,0,0.1)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
