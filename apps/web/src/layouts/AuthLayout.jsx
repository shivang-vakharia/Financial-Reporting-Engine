import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}
