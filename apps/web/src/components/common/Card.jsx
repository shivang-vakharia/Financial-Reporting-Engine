import React from 'react';

export default function Card({
  title,
  subtitle,
  children,
  actions,
  className = '',
  ...props
}) {
  return (
    <div className={`panel ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {subtitle && <p className="muted" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
      )}
      <div className="panel-body">{children}</div>
      {actions && <div className="panel-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>{actions}</div>}
    </div>
  );
}
