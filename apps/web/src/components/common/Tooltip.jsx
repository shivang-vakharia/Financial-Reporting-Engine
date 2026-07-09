import React, { useState } from 'react';

export default function Tooltip({
  content,
  children
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '6px 10px',
            background: 'rgba(25, 28, 30, 0.9)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
