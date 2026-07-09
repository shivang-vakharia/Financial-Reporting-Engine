import React from 'react';
import ReportsView from "../components/reports/ReportView.jsx";
import { downloadFile } from "../services/api.js";

export default function ReportsPage({
  selectedCompany,
  reports
}) {
  return (
    <ReportsView
      company={selectedCompany}
      reports={reports}
      onDownload={async (report) => {
        await downloadFile(`/report-runs/${report.id}/download`, report.fileName);
      }}
    />
  );
}
