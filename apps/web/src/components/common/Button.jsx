import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, ghost, danger
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${variant} ${loading ? 'loading' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner size={16} /> : children}
    </button>
  );
}
