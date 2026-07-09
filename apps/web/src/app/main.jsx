import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
Building2,
Download,
FileSpreadsheet,
LayoutDashboard,
LogOut,
Plus,
Settings,
Upload,
Wand2,
Loader2,
CheckCircle2
} from "lucide-react";
  
import { downloadFile } from "../services/api.js";

import {
    deleteCompany as deleteCompanyApi,
} from "../services/companyService.js";

import {
    setAuthSession,
    clearAuthSession,
} from "../services/authService.js";
import '../styles/styles.css';
import LandingPage from "../components/auth/LandingPage.jsx";
import Panel from "../components/common/Panel.jsx";
import Stat from "../components/common/Stat.jsx";
import CompanyMetadata from "../components/company/CompanyMetadata.jsx";
import CreateCompany from "../components/company/CreateCompany.jsx";
import CreatePeriod from "../components/period/CreatePeriod.jsx";
import MappingTable from "../components/mapping/MappingTable.jsx";
import ReportGenerator from '../components/reports/ReportGenerator.jsx';
import ReportsView from '../components/reports/ReportView.jsx';
import SettingsView from '../components/settings/SettingsView.jsx';
import UploadTrialBalance from "../components/upload/UploadTrialBalance.jsx";
import useCompanies from "../hooks/useCompanies";
import usePeriods from "../hooks/usePeriods";
import useMapping from "../hooks/useMapping";
import useScheduleLines from '../hooks/useScheduleLines.js';
import useUploads from '../hooks/useUploads.js';
import useReports from '../hooks/useReports.js';

function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [message, setMessage] = useState("");
  const {

    companies,
    companyId,
    setCompanyId,
    selectedCompany,
    refreshCompanies
    
  } = useCompanies();

  const {

    periods,
    periodId,
    setPeriodId,
    selectedPeriod,
    refreshPeriods

  } = usePeriods();

  const {

    mapping,
    refreshMapping,
    updateMappingResult

  } = useMapping();

  const {

    uploads,
    refreshUploads

  } = useUploads();

  const {
    scheduleLines,
    refreshScheduleLines
  } = useScheduleLines();

  const {
      reports,
      refreshReports,
      clearReports
  } = useReports();

  useEffect(() => {
    if (!session?.token) return;

    async function initialize() {

      const companyList = await refreshCompanies();

      await refreshScheduleLines();

      if (companyList.length === 0) {

        clearReports();

        setCompanyId("");

        setPeriodId("");

        return;

      }

      const nextCompanyId =
        companyId &&
        companyList.some(c => c.id === companyId)
          ? companyId
          : companyList[0].id;

      setCompanyId(nextCompanyId);

      await refreshReports(nextCompanyId);

    }

    initialize();
  }, [session?.token]);

  useEffect(() => {

    if (!companyId) {

      setPeriodId("");

      return;

    }

    async function loadPeriods() {

      const periodList =
        await refreshPeriods(companyId);

        if (periodList.length === 0) {

          setPeriodId("");

          return;

        }

        if (
            !periodList.some(
                period => period.id === periodId
            )
        ) {

          setPeriodId(periodList[0].id);

        }

    }

    loadPeriods();

  }, [companyId]);

  useEffect(() => {
    if (!periodId) return;
    refreshMapping(periodId);
    refreshUploads(periodId);
  }, [periodId]);

  
  async function deleteCompany(id) {

    if (
      !id ||
      !confirm(
        "Delete this company and all associated periods, uploads, and reports?"
      )
    ) {
      return;
    }

    await deleteCompanyApi(id);

    const companyList = await refreshCompanies();

    if (companyList.length === 0) {

      clearReports();

      setCompanyId("");

      setPeriodId("");

      return;

  }

    const nextCompanyId = companyList[0].id;

    setCompanyId(nextCompanyId);

    await refreshReports(nextCompanyId);

}

  async function handleSession(payload) {
    setAuthSession(payload);
    setSession(payload);
    setShowAuthModal(false);
  }

  async function logout() {
    clearAuthSession();
    setSession(null);
  }

  if (!session?.token) return <LandingPage onSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }} onLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} onSession={handleSession} showAuth={showAuthModal} authMode={authMode} onCloseAuth={() => setShowAuthModal(false)} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CA</div>
          <div>
            <strong>CA Portal</strong>
            <span>Professional Suite</span>
          </div>
        </div>
        <nav>
          <button type="button" className={currentView === 'home' ? 'active' : ''} onClick={() => setCurrentView('home')}><LayoutDashboard size={18} /> Home</button>
          <button type="button" className={currentView === 'workspace' ? 'active' : ''} onClick={() => setCurrentView('workspace')}><FileSpreadsheet size={18} /> Workspace</button>
          <button type="button" className={currentView === 'reports' ? 'active' : ''} onClick={() => setCurrentView('reports')}><FileSpreadsheet size={18} /> Reports</button>
          <button type="button" className={currentView === 'settings' ? 'active' : ''} onClick={() => setCurrentView('settings')}><Settings size={18} /> Settings</button>
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <strong>AuditExpress</strong>
          <div className="topbar-controls">
            <select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
              <option value="">Select company</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
              <option value="">Select period</option>
              {periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}
            </select>
            <button className="ghost" onClick={logout}><LogOut size={16} /> Sign out</button>
          </div>
        </header>

        <section className="page-header">
          <div>
            <p>{currentView === 'home' ? 'Welcome to your financial reporting workspace' : currentView === 'workspace' ? 'Workspace / Ind AS Schedule III / Financial Results' : currentView === 'reports' ? 'Reports / Download history' : 'Settings and preferences'}</p>
            <h1>{currentView === 'home' ? 'Welcome back' : currentView === 'workspace' ? 'Financial Reporting Workspace' : currentView === 'reports' ? 'Report Library' : 'Settings'}</h1>
          </div>
          {currentView === 'workspace' && (
            <div className="actions">
              <CreateCompany onCreated={async (company) => { await refreshCompanies(); setCompanyId(company.id); }} />
              {selectedCompany && <CreatePeriod company={selectedCompany} onCreated={async (period) => { await refreshPeriods(companyId); setPeriodId(period.id); }} />}
            </div>
          )}
        </section>

        {currentView === 'home' && (
          <div>
            <section className="stats-grid">
              <Stat label="Companies" value={companies.length} />
              <Stat label="Uploaded TBs" value={uploads.length} />
              <Stat label="Mapped Ledgers" value={mapping.summary.mapped} />
              <Stat label="Unmapped" value={mapping.summary.unmapped} tone={mapping.summary.unmapped ? 'danger' : ''} />
            </section>
            <section className="grid-two">
              <Panel title="Quick Start">
                <p>Use the workspace to upload trial balances, map ledgers, and generate statutory reports.</p>
                <div className="actions">
                  <CreateCompany onCreated={async (company) => { await refreshCompanies(); setCompanyId(company.id); }} />
                  {selectedCompany && <CreatePeriod company={selectedCompany} onCreated={async (period) => { await refreshPeriods(companyId); setPeriodId(period.id); }} />}
                </div>
              </Panel>
              <Panel title="Selected Company">
                {selectedCompany ? (
                  <>
                    <p><strong>{selectedCompany.name}</strong></p>
                    <p>{selectedCompany.cin}</p>
                    <p>{selectedCompany.registeredOffice}</p>
                    <button className="secondary" type="button" onClick={() => setCurrentView('workspace')}>Go to workspace</button>
                  </>
                ) : (
                  <p className="muted">Create or choose a company to begin reviewing trial balances and generating reports.</p>
                )}
              </Panel>
            </section>
          </div>
        )}

        {currentView === 'workspace' && (
          <>
            <section className="stats-grid">
              <Stat label="Companies" value={companies.length} />
              <Stat label="Uploaded TBs" value={uploads.length} />
              <Stat label="Mapped Ledgers" value={mapping.summary.mapped} />
              <Stat label="Unmapped" value={mapping.summary.unmapped} tone={mapping.summary.unmapped ? 'danger' : ''} />
            </section>
            <section className="grid-two">
              <CompanyMetadata company={selectedCompany} onSaved={refreshCompanies} onDeleted={deleteCompany} />
              <UploadTrialBalance period={selectedPeriod} onUploaded={async (result) => {
                setMessage(`Parsed ${result.validation.rowCount} rows. Unmapped ledgers: ${result.mappingSummary.unmapped}.`);
                await refreshMapping(periodId);
                await refreshUploads(periodId);
              }} />
            </section>
            {message && <div className="notice">{message}</div>}
            <MappingTable mapping={mapping} scheduleLines={scheduleLines} onMappingUpdated={updateMappingResult} />
            <ReportGenerator
              company={selectedCompany}
              period={selectedPeriod}
              periods={periods}
              reports={reports}
              onGenerated={async () => {
                setMessage('Report generated. It is available in download history.');
                await refreshReports(companyId);
              }}
            />
          </>
        )}

        {currentView === 'reports' && (
          <ReportsView company={selectedCompany} reports={reports} onDownload={async (report) => {
            await downloadFile(`/report-runs/${report.id}/download`, report.fileName);
          }} />
        )}

        {currentView === 'settings' && (
          <SettingsView session={session} />
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
