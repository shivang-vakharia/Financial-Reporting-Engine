import React from 'react';

export default function Table({
  headers = [],
  rows = [],
  renderRow,
  className = '',
  ...props
}) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className={`table ${className}`} {...props}>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '24px' }}>
                <span className="muted">No data available</span>
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => renderRow(row, idx))
          )}
        </tbody>
      </table>
    </div>
  );
}
