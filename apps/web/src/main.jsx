  import React, { useEffect, useMemo, useState } from 'react';
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
  import { api, downloadFile, setToken } from './services/api.js';
  import './styles.css';

  function App() {
    const [session, setSession] = useState(loadSession);
    const [companies, setCompanies] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [companyId, setCompanyId] = useState('');
    const [periodId, setPeriodId] = useState('');
    const [mapping, setMapping] = useState({ mappings: [], summary: { total: 0, mapped: 0, unmapped: 0 } });
    const [uploads, setUploads] = useState([]);
    const [reports, setReports] = useState([]);
    const [scheduleLines, setScheduleLines] = useState([]);
    const [message, setMessage] = useState('');
    const [currentView, setCurrentView] = useState('home');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    useEffect(() => {
      if (!session?.token) return;
      setToken(session.token);
      refreshCompanies();
      refreshScheduleLines();
      refreshReports(companyId);
    }, [session?.token]);

    useEffect(() => {
      if (!companyId) return;
      refreshPeriods(companyId);
      refreshReports(companyId);
    }, [companyId]);

    useEffect(() => {
      if (!periodId) return;
      refreshMapping(periodId);
      refreshUploads(periodId);
    }, [periodId]);

    const selectedCompany = companies.find((item) => item.id === companyId);
    const selectedPeriod = periods.find((item) => item.id === periodId);

    async function refreshCompanies() {
      const data = await api('/companies');
      setCompanies(data);
      if (data[0] && !companyId) setCompanyId(data[0].id);
      return data;
    }

    async function refreshScheduleLines() {
      const data = await api('/schedule-lines');
      setScheduleLines(data);
    }

    async function refreshPeriods(id) {
      const data = await api(`/companies/${id}/periods`);
      setPeriods(data);
      if (data[0] && !data.some((item) => item.id === periodId)) setPeriodId(data[0].id);
    }

    async function refreshMapping(id) {
      const data = await api(`/periods/${id}/mapping-results`);
      setMapping(data);
    }

    async function refreshUploads(id) {
      const data = await api(`/periods/${id}/uploads`);
      setUploads(data);
    }

    async function refreshReports(selectedCompanyId) {
      if (selectedCompanyId) {
        setReports(await api(`/companies/${selectedCompanyId}/report-runs`));
        return;
      }
      setReports(await api('/report-runs'));
    }

    async function deleteCompany(id) {
      if (!id || !confirm('Delete this company and all associated periods, uploads, and reports?')) return;
      await api(`/companies/${id}`, { method: 'DELETE' });
      const companies = await refreshCompanies();
      const nextCompanyId = companies[0]?.id || '';
      setCompanyId(nextCompanyId);
      if (!nextCompanyId) {
        setPeriodId('');
        setPeriods([]);
      }
      await refreshReports(nextCompanyId);
    }

    async function updateMappingResult(mappingId, scheduleLineId) {
      if (!periodId || !mappingId || !scheduleLineId) return;
      await api(`/periods/${periodId}/mapping-results/${mappingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ scheduleLineId })
      });
      await refreshMapping(periodId);
    }

    async function handleSession(payload) {
      localStorage.setItem('fre-session', JSON.stringify(payload));
      setToken(payload.token);
      setSession(payload);
      setShowAuthModal(false);
    }

    async function logout() {
      localStorage.removeItem('fre-session');
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

  function AuthScreen({ mode: initialMode, onSession }) {
    const [mode, setMode] = useState(initialMode || 'login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    useEffect(() => {
      setMode(initialMode || 'login');
      setError('');
    }, [initialMode]);

    async function submit(event) {
      event.preventDefault();
      setError('');
      try {
        const payload = await api(`/auth/${mode === 'login' ? 'login' : 'signup'}`, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        onSession(payload);
      } catch (err) {
        setError(err.message);
      }
    }

    return (
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand"><Building2 /> <strong>AuditExpress</strong></div>
        {mode === 'signup' && <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="error">{error}</p>}
        <button className="primary">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        <button type="button" className="link-button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    );
  }

  function LandingPage({ onSignup, onLogin, onSession, showAuth, authMode, onCloseAuth }) {
    return (
      <div className="landing-page">
        <header className="landing-header">
          <div className="landing-brand">
            <Building2 size={24} />
            <span><strong>AuditExpress</strong></span>
          </div>
          <div className="landing-actions">
            <button className="secondary" onClick={onSignup}>Sign Up</button>
            <button className="primary" onClick={onLogin}>Log In</button>
          </div>
        </header>

        {showAuth && (
          <div className="modal-overlay" onClick={onCloseAuth}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={onCloseAuth}>✕</button>
              <AuthScreen mode={authMode} onSession={onSession} />
            </div>
          </div>
        )}

        <div className="landing-content">
          <section className="landing-hero">
            <h1>Professional Financial Reporting Engine</h1>
            <p>Streamline your Ind AS compliance reporting with intelligent ledger mapping and automated report generation.</p>
            <div className="landing-cta">
              <button className="primary" onClick={onSignup}>Get Started</button>
              <button className="secondary" onClick={onLogin}>Sign In</button>
            </div>
          </section>

          <section className="landing-features">
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h3>Trial Balance Upload</h3>
              <p>Upload Excel trial balances and automatically parse ledger entries with validation.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>Smart Ledger Mapping</h3>
              <p>Rule-based mapping of ledgers to Schedule III lines with manual override capability.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📄</div>
              <h3>Report Generation</h3>
              <p>Generate standalone and consolidated Ind AS reports with comparative period support.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔍</div>
              <h3>Unmapped Entry Review</h3>
              <p>Easily identify and map unmapped ledger entries with dropdown selection.</p>
            </div>
          </section>

          <section className="landing-footer">
            <p>&copy; 2026 AuditExpress. Professional financial reporting suite.</p>
          </section>
        </div>
      </div>
    );
  }

  function CreateCompany({ onCreated }) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
      name: "",
      cin: "",
      registeredOffice: "",
    });

    const { loading, success, run } = useAsyncStatus();

    async function submit(event) {
      event.preventDefault();

      await run(async () => {
        const company = await api("/companies", {
          method: "POST",
          body: JSON.stringify(form),
        });

        setOpen(false);

        setForm({
          name: "",
          cin: "",
          registeredOffice: "",
        });

        onCreated(company);
      });
    }

    return open ? (
      <form
        className="inline-form"
        onSubmit={submit}
      >
        <input
          placeholder="Company name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          placeholder="CIN"
          value={form.cin}
          onChange={(e) =>
            setForm({
              ...form,
              cin: e.target.value,
            })
          }
        />

        <AsyncButton
          loading={loading}
          success={success}
          type="submit"
        >
          {loading ? "Saving..." : success ? "Saved" : "Save"}
        </AsyncButton>
      </form>
    ) : (
      <button
        className="primary"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Add Company
      </button>
    );
  }

  function CreatePeriod({ company, onCreated }) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
      label: "FY 2025-26 Q1",
      periodType: "quarterly",
      startDate: "2025-04-01",
      endDate: "2025-06-30",
    });

    const { loading, success, run } = useAsyncStatus();

    async function submit(event) {
      event.preventDefault();

      await run(async () => {
        const period = await api(
          `/companies/${company.id}/periods`,
          {
            method: "POST",
            body: JSON.stringify(form),
          }
        );

        setOpen(false);

        onCreated(period);
      });
    }

    return open ? (
      <form
        className="inline-form"
        onSubmit={submit}
      >
        <input
          value={form.label}
          onChange={(e) =>
            setForm({
              ...form,
              label: e.target.value,
            })
          }
        />

        <select
          value={form.periodType}
          onChange={(e) =>
            setForm({
              ...form,
              periodType: e.target.value,
            })
          }
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="half_yearly">Half-yearly</option>
          <option value="annual">Annual</option>
        </select>

        <AsyncButton
          loading={loading}
          success={success}
          type="submit"
        >
          {loading ? "Saving..." : success ? "Saved" : "Save"}
        </AsyncButton>
      </form>
    ) : (
      <button
        className="secondary"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Add Period
      </button>
    );
  }

  function CompanyMetadata({ company, onSaved, onDeleted }) {
    const [form, setForm] = useState({});

    const { loading, success, run } = useAsyncStatus();
    useEffect(() => {
      if (company) setForm({ ...company.metadata, name: company.name, cin: company.cin, registeredOffice: company.registeredOffice });
    }, [company?.id]);
    if (!company) return <Panel title="Company Metadata"><p className="muted">Create a company to begin.</p></Panel>;
    async function save(event) {
      event.preventDefault();

      await run(async () => {
        await api(`/companies/${company.id}/metadata`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });

        onSaved();
      });
    }
    return (
      <Panel title="Report Metadata" actions={
        <AsyncDeleteButton
            companyId={company.id}
            onDeleted={onDeleted}
        />
      }>
        <form className="metadata-grid" onSubmit={save}>
          {['name', 'cin', 'registeredOffice', 'auditStatus', 'boardMeetingDate', 'paidUpCapital', 'faceValue', 'directorName', 'din', 'place'].map((key) => (
            <Field key={key} label={labelize(key)} value={form[key] || ''} onChange={(value) => setForm({ ...form, [key]: value })} />
          ))}
          <AsyncButton
            loading={loading}
            success={success}
            type="submit"
        >
            {loading
                ? "Saving..."
                : success
                ? "Saved"
                : "Save Metadata"}
        </AsyncButton>
        </form>
      </Panel>
    );
  }

  function UploadTrialBalance({ period, onUploaded }) {
    const [file, setFile] = useState(null);

    const [dragging, setDragging] =
      useState(false);

    const [status, setStatus] =
      useState("idle");

    const [summary, setSummary] =
      useState(null);

    const {
      loading,
      success,
      run,
    } = useAsyncStatus();

    function readableSize(bytes) {
      if (!bytes) return "";

      if (bytes < 1024)
        return bytes + " B";

      if (bytes < 1024 * 1024)
        return (
          (bytes / 1024).toFixed(1) +
          " KB"
        );

      return (
        (bytes / 1024 / 1024).toFixed(1) +
        " MB"
      );
    }

    async function submit(e) {
      e.preventDefault();

      if (!period || !file) return;

      await run(async () => {
        setStatus("uploading");

        const formData = new FormData();

        formData.append(
          "trialBalance",
          file
        );

        const result = await api(
          `/periods/${period.id}/uploads`,
          {
            method: "POST",
            body: formData,
            isForm: true,
          }
        );

        setStatus("completed");

        setSummary({
          rows:
            result.validation.rowCount,
          mapped:
            result.mappingSummary
              .mapped,
          unmapped:
            result.mappingSummary
              .unmapped,
        });

        onUploaded(result);

        setFile(null);

        setTimeout(() => {
          setStatus("idle");
        }, 1800);
      });
    }

    function onDrop(e) {
      e.preventDefault();

      setDragging(false);

      if (
        e.dataTransfer.files.length
      ) {
        setFile(
          e.dataTransfer.files[0]
        );

        setSummary(null);
      }
    }

    return (
      <Panel title="Upload Trial Balance">
        <form
          className="upload-card"
          onSubmit={submit}
        >
          <div
            className={`drop-zone ${
              dragging
                ? "dragging"
                : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();

              setDragging(true);
            }}
            onDragLeave={() =>
              setDragging(false)
            }
            onDrop={onDrop}
          >
            <Upload size={42} />

            <h3>
              Upload Excel Workbook
            </h3>

            <p>
              Drag & drop your trial
              balance here
            </p>

            <label className="upload-btn">
              Select Workbook

              <input
                hidden
                type="file"
                accept=".xlsx,.xls,.xlsm"
                onChange={(e) => {
                  if (
                    e.target.files
                      ?.length
                  ) {
                    setFile(
                      e.target.files[0]
                    );

                    setSummary(
                      null
                    );
                  }
                }}
              />
            </label>
          </div>

          {file && (
            <div className="selected-file-card">
              <div className="selected-file-title">
                ✔ Selected File
              </div>

              <div>
                {file.name}
              </div>

              <small>
                {readableSize(
                  file.size
                )}
              </small>
            </div>
          )}

          <div className="upload-status-card">
            <div className="status-title">
              Status
            </div>

            {status === "idle" && (
              <span className="status-chip ready">
                Ready
              </span>
            )}

            {status ===
              "uploading" && (
              <>
                <span className="status-chip processing">
                  <LoadingSpinner />
                  Uploading &
                  Parsing...
                </span>

                <div className="progress-bar">
                  <div className="progress-indeterminate" />
                </div>
              </>
            )}

            {status ===
              "completed" && (
              <span className="status-chip success">
                <CheckCircle2
                  size={15}
                />
                Upload Complete
              </span>
            )}
          </div>

          {summary && (
            <div className="upload-summary">
              <div>
                <span>Rows</span>

                <strong>
                  {summary.rows}
                </strong>
              </div>

              <div>
                <span>
                  Mapped
                </span>

                <strong>
                  {summary.mapped}
                </strong>
              </div>

              <div>
                <span>
                  Unmapped
                </span>

                <strong className="danger">
                  {
                    summary.unmapped
                  }
                </strong>
              </div>
            </div>
          )}

          <AsyncButton
            type="submit"
            loading={loading}
            success={success}
            disabled={
              !file || !period
            }
            className="primary upload-submit"
          >
            {loading
              ? "Parsing..."
              : success
              ? "Completed"
              : "Parse & Map"}
          </AsyncButton>
        </form>
      </Panel>
    );
  }

  function MappingTable({ mapping, scheduleLines, onMappingUpdated }) {
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

  function ReportGenerator({ company, period, periods, reports, onGenerated }) {
    const [metadata, setMetadata] = useState({ reportType: 'standalone' });
    const [comparativePeriodIds, setComparativePeriodIds] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
      setComparativePeriodIds([]);
    }, [period?.id]);

    const comparativeOptions = periods.filter((item) => item.id !== period?.id);

    async function generate() {
      if (!period) return;
      setError('');
      await api(`/periods/${period.id}/report-runs`, {
        method: 'POST',
        body: JSON.stringify({ reportType: metadata.reportType, metadata, comparativePeriodIds })
      });
      onGenerated();
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
      <Panel title="Report Generation and History" actions={<button className="primary" onClick={generate} disabled={!company || !period}><Wand2 size={16} /> Generate Excel</button>}>
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

  function ReportsView({ company, reports, onDownload }) {
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

  function SettingsView({ session }) {
    return (
      <Panel title="Application Settings">
        <p className="muted">Manage your account settings and workspace preferences in future releases.</p>
        <div className="settings-block">
          <div><strong>Signed in as</strong></div>
          <div>{session?.user?.name} ({session?.user?.email})</div>
        </div>
        <div className="settings-block">
          <div><strong>Provider</strong></div>
          <div>{session ? 'Local development' : 'Unknown'}</div>
        </div>
      </Panel>
    );
  }

  function Panel({ title, actions, children }) {
    return <section className="panel"><div className="panel-head"><h2>{title}</h2>{actions}</div>{children}</section>;
  }

  function Stat({ label, value, tone }) {
    return <div className="stat"><span>{label}</span><strong className={tone}>{value}</strong></div>;
  }

  function Field({ label, value, onChange, type = 'text' }) {
    return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
  }

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem('fre-session') || 'null');
    } catch {
      return null;
    }
  }

  function labelize(value) {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value || 0);
  }

  function useAsyncStatus() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function run(action) {
      setLoading(true);
      setSuccess(false);

      try {
        const result = await action();

        setLoading(false);
        setSuccess(true);

        setTimeout(() => {
          setSuccess(false);
        }, 1500);

        return result;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }

    return {
      loading,
      success,
      run
    };
  }

  function LoadingSpinner({ size = 16 }) {
    return (
      <Loader2
        size={size}
        className="spin"
      />
    );
  }

  function ButtonStatusIcon({ loading, success }) {
    if (loading) {
      return <LoadingSpinner size={16} />;
    }

    if (success) {
      return (
        <CheckCircle2
          size={16}
          className="success-icon"
        />
      );
    }

    return null;
  }

  function AsyncButton({
    loading,
    success,
    children,
    className = "primary",
    disabled,
    ...props
  }) {
    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={[
          className,
          loading && "button-loading",
          success && "button-success",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ButtonStatusIcon
          loading={loading}
          success={success}
        />

        <span>{children}</span>
      </button>
    );
  }

  function AsyncDeleteButton({
    companyId,
    onDeleted,
  }) {
    const { loading, success, run } =
      useAsyncStatus();

    return (
      <AsyncButton
        className="danger"
        loading={loading}
        success={success}
        onClick={() =>
          run(async () => {
            await onDeleted(companyId);
          })
        }
      >
        {loading
          ? "Deleting..."
          : success
          ? "Deleted"
          : "Delete Company"}
      </AsyncButton>
    );
  }
  createRoot(document.getElementById('root')).render(<App />);
