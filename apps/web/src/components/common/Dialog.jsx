import React from 'react';
import Button from './Button';

export default function Dialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(400px, 100%)' }}>
        {title && <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>{title}</h3>}
        <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="secondary" type="button" onClick={onCancel} disabled={loading} style={{ border: '1px solid var(--outline)', padding: '6px 12px', borderRadius: '4px', background: 'transparent' }}>
            {cancelText}
          </button>
          <Button variant="danger" onClick={onConfirm} loading={loading} style={{ background: 'var(--danger)', color: 'white', border: 0, padding: '6px 12px', borderRadius: '4px' }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
