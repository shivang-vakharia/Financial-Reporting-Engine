import React from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {title && <h2 className="modal-title" style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>{title}</h2>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
