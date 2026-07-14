import React from 'react';
import Stat from "../components/common/Stat.jsx";
import CompanyMetadata from "../components/company/CompanyMetadata.jsx";
import UploadTrialBalance from "../components/upload/UploadTrialBalance.jsx";
import MappingTable from "../components/mapping/MappingTable.jsx";
import ReportGenerator from "../components/reports/ReportGenerator.jsx";
import { NOTICES } from "../constants/messages.js";

export default function WorkspacePage({
  companies,
  uploads,
  mapping,
  selectedCompany,
  selectedPeriod,
  periods,
  reports,
  refreshCompanies,
  deleteCompany,
  periodId,
  companyId,
  refreshMapping,
  refreshUploads,
  refreshReports,
  scheduleLines,
  updateMappingResult,
  message,
  setMessage
}) {
  return (
    <>
      <section className="stats-grid">
        <Stat label="Companies" value={companies.length} />
        <Stat label="Uploaded TBs" value={uploads.length} />
        <Stat label="Mapped Ledgers" value={mapping.summary.mapped} />
        <Stat
          label="Unmapped"
          value={mapping.summary.unmapped}
          tone={mapping.summary.unmapped ? 'danger' : ''}
        />
      </section>
      <section className="grid-two">
        <CompanyMetadata
          company={selectedCompany}
          onSaved={refreshCompanies}
          onDeleted={deleteCompany}
        />
        <UploadTrialBalance
          period={selectedPeriod}
          onUploaded={async (result) => {
            setMessage(NOTICES.TB_UPLOADED(result.validation.rowCount, result.mappingSummary.unmapped));
            await refreshMapping(periodId);
            await refreshUploads(periodId);
          }}
        />
      </section>
      {message && <div className="notice">{message}</div>}
      <MappingTable
          mapping={mapping}
          scheduleLines={scheduleLines}
          onMappingUpdated={(mappingId, scheduleLineId) =>
            updateMappingResult(periodId, mappingId, scheduleLineId)
          }
        />
      <ReportGenerator
        company={selectedCompany}
        period={selectedPeriod}
        periods={periods}
        reports={reports}
        onGenerated={async () => {
          setMessage(NOTICES.REPORT_GENERATED);
          await refreshReports(companyId);
        }}
      />
    </>
  );
}
