import React from 'react';
import Stat from "../components/common/Stat.jsx";
import Panel from "../components/common/Panel.jsx";
import CreateCompany from "../components/company/CreateCompany.jsx";
import CreatePeriod from "../components/period/CreatePeriod.jsx";
import { VIEWS } from "../constants/routes.js";

export default function HomePage({
  companies,
  uploads,
  mapping,
  selectedCompany,
  refreshCompanies,
  setCompanyId,
  refreshPeriods,
  setPeriodId,
  setCurrentView,
  companyId
}) {
  return (
    <div>
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
        <Panel title="Quick Start">
          <p>Use the workspace to upload trial balances, map ledgers, and generate statutory reports.</p>
          <div className="actions">
            <CreateCompany
              onCreated={async (company) => {
                await refreshCompanies();
                setCompanyId(company.id);
              }}
            />
            {selectedCompany && (
              <CreatePeriod
                company={selectedCompany}
                onCreated={async (period) => {
                  await refreshPeriods(companyId);
                  setPeriodId(period.id);
                }}
              />
            )}
          </div>
        </Panel>
        <Panel title="Selected Company">
          {selectedCompany ? (
            <>
              <p><strong>Name: {selectedCompany.name}</strong></p>
              <p><strong>CIN Number:</strong> {selectedCompany.cin}</p>
              <p><strong>Registered Office:</strong> {selectedCompany.registeredOffice}</p>
              <div className="actions" style={{ marginTop: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => setCurrentView(VIEWS.WORKSPACE)}
                >
                  Go to Workspace
                </button>
              </div>
            </>
          ) : (
            <p className="muted">Create or choose a company to begin reviewing trial balances and generating reports.</p>
          )}
        </Panel>
      </section>
    </div>
  );
}
