import React, { useEffect, useMemo, useState } from 'react';
import { api } from "../services/api";
import Panel from "../common/Panel"
import { Download, Wand2 } from 'lucide-react';
import { downloadFile, setToken } from "../services/api.js";
import AsyncButton from "../common/AsyncButton";
import useAsyncStatus from "../../hooks/useAsyncStatus";

const {
    loading,
    success,
    run,
} = useAsyncStatus();

export default function ReportGenerator({ company, period, periods, reports, onGenerated }) {
    const [metadata, setMetadata] = useState({ reportType: 'standalone' });
    const [comparativePeriodIds, setComparativePeriodIds] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
      setComparativePeriodIds([]);
    }, [period?.id]);

    const comparativeOptions = periods.filter((item) => item.id !== period?.id);

    async function generate() {
      if (!period) return;

      setError("");

      await run(async () => {
        await api(`/periods/${period.id}/report-runs`, {
          method: "POST",
          body: JSON.stringify({
            reportType: metadata.reportType,
            metadata,
            comparativePeriodIds,
          }),
        });

        await onGenerated();
      });
    }

    async function downloadReport(report) {
      setError('');
      try {
        await downloadFile(`/report-runs/${report.id}/download`, report.fileName);
      } catch (err) {
        setError(err.message);
      }
    }
    return (
      <Panel title="Report Generation and History" actions={
        <AsyncButton
          loading={loading}
          success={success}
          onClick={generate}
          disabled={!company || !period}
          className="primary"
        >
          <Wand2 size={16} />
          Generate Excel
        </AsyncButton>}>

        <div className="report-options">
          <label>Report type</label>
          <select value={metadata.reportType} onChange={(event) => setMetadata({ ...metadata, reportType: event.target.value })}>
            <option value="standalone">Standalone</option>
            <option value="consolidated">Consolidated</option>
          </select>
        </div>
        <div className="report-options">
          <label>Comparative periods</label>
          <select
            multiple
            value={comparativePeriodIds}
            onChange={(event) => setComparativePeriodIds(Array.from(event.target.selectedOptions).map((option) => option.value))}
            size={Math.min(6, comparativeOptions.length || 1)}
          >
            {comparativeOptions.map((periodItem) => (
              <option key={periodItem.id} value={periodItem.id}>{periodItem.label}</option>
            ))}
          </select>
          <span className="muted">Select up to 3 prior periods to populate comparative columns.</span>
        </div>
        <div className="report-options">
          <span className="muted">Exports are allowed even when unmapped ledgers exist. They are listed in the workbook.</span>
        </div>
        {error && <p className="inline-error">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Report</th><th>Status</th><th>Generated</th><th>Action</th></tr></thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.fileName || `${report.reportType} report`}</td>
                  <td><span className="badge ok">{report.status}</span></td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td><button className="download" onClick={() => downloadReport(report)}><Download size={16} /> Download</button></td>
                </tr>
              ))}
              {!reports.length && <tr><td colSpan="4" className="empty">No generated reports yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    );
}