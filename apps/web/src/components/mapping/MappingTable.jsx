import React, { useEffect, useMemo, useState } from 'react';
import Panel from "../common/Panel"
import formatMoney from "../../utils/formatMoney";

export default function MappingTable({ mapping, scheduleLines, onMappingUpdated }) {
    const [collapsed, setCollapsed] = useState(false);
    const rows = useMemo(() => mapping.mappings.slice(0, 100), [mapping.mappings]);
    return (
      <Panel
        title="Ledger Mapping Review"
        actions={
          <div className="panel-actions-inline">
            <span className="badge danger">{mapping.summary.unmapped} unmapped</span>
            <button className="ghost" type="button" onClick={() => setCollapsed((prev) => !prev)}>
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        }
      >
        {!collapsed ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ledger</th><th>Amount</th><th>Schedule III Line</th><th>XBRL Element</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={row.status === 'unmapped' ? 'row-danger' : ''}>
                    <td>{row.rawName}</td>
                    <td className="num">{formatMoney(row.netAmount)}</td>
                    <td>
                      {row.status === 'unmapped' ? (
                        <select value={row.scheduleLineId || ''} onChange={(event) => onMappingUpdated(row.id, event.target.value)}>
                          <option value="">Choose schedule line</option>
                          {scheduleLines.map((line) => (
                            <option key={line.id} value={line.id}>{line.label}</option>
                          ))}
                        </select>
                      ) : (
                        row.scheduleLabel
                      )}
                    </td>
                    <td>{row.xbrlElement || '-'}</td>
                    <td><span className={`badge ${row.status === 'unmapped' ? 'danger' : 'ok'}`}>{row.status}</span></td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan="5" className="empty">Upload a trial balance to view mappings.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Ledger mapping review is collapsed. Expand to inspect mappings and assign unmapped entries.</p>
        )}
      </Panel>
    );
  }