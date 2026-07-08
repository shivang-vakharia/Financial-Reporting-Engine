import React, { useEffect, useMemo, useState } from 'react';
import { Download } from "lucide-react";
import Panel from "../common/Panel";

export default function ReportsView({ company, reports, onDownload }) {
    return (
      <Panel title="Report History">
        {company ? (
          <>
            <p className="muted">Showing reports for <strong>{company.name}</strong>. Use the workspace to upload trial balances and generate new report runs.</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Report</th><th>Status</th><th>Generated</th><th>Action</th></tr></thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.fileName || `${report.reportType} report`}</td>
                      <td><span className="badge ok">{report.status}</span></td>
                      <td>{new Date(report.createdAt).toLocaleString()}</td>
                      <td><button className="download" onClick={() => onDownload(report)}><Download size={16} /> Download</button></td>
                    </tr>
                  ))}
                  {!reports.length && <tr><td colSpan="4" className="empty">No reports generated for this company yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="muted">Select a company above to filter reports by company.</p>
        )}
      </Panel>
    );
  }