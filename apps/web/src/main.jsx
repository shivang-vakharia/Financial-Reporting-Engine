import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, Download, FileSpreadsheet, LayoutDashboard, LogOut, Plus, Settings, Upload, Wand2 } from 'lucide-react';
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
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session?.token) return;
    setToken(session.token);
    refreshCompanies();
    refreshReports();
  }, [session?.token]);

  useEffect(() => {
    if (!companyId) return;
    refreshPeriods(companyId);
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

  async function refreshReports() {
    setReports(await api('/report-runs'));
  }

  async function handleSession(payload) {
    localStorage.setItem('fre-session', JSON.stringify(payload));
    setToken(payload.token);
    setSession(payload);
  }

  async function logout() {
    localStorage.removeItem('fre-session');
    setSession(null);
  }

  if (!session?.token) return <AuthScreen onSession={handleSession} />;

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
          <a className="active"><LayoutDashboard size={18} /> Workspace</a>
          <a><FileSpreadsheet size={18} /> Reports</a>
          <a><Settings size={18} /> Settings</a>
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
            <p>Workspace / Ind AS Schedule III / Financial Results</p>
            <h1>Financial Reporting Workspace</h1>
          </div>
          <div className="actions">
            <CreateCompany onCreated={async (company) => { await refreshCompanies(); setCompanyId(company.id); }} />
            {selectedCompany && <CreatePeriod company={selectedCompany} onCreated={async (period) => { await refreshPeriods(companyId); setPeriodId(period.id); }} />}
          </div>
        </section>

        <section className="stats-grid">
          <Stat label="Companies" value={companies.length} />
          <Stat label="Uploaded TBs" value={uploads.length} />
          <Stat label="Mapped Ledgers" value={mapping.summary.mapped} />
          <Stat label="Unmapped" value={mapping.summary.unmapped} tone={mapping.summary.unmapped ? 'danger' : ''} />
        </section>

        <section className="grid-two">
          <CompanyMetadata company={selectedCompany} onSaved={refreshCompanies} />
          <UploadTrialBalance period={selectedPeriod} onUploaded={async (result) => {
            setMessage(`Parsed ${result.validation.rowCount} rows. Unmapped ledgers: ${result.mappingSummary.unmapped}.`);
            await refreshMapping(periodId);
            await refreshUploads(periodId);
          }} />
        </section>

        {message && <div className="notice">{message}</div>}

        <MappingTable mapping={mapping} />

        <ReportGenerator
          company={selectedCompany}
          period={selectedPeriod}
          periods={periods}
          reports={reports}
          onGenerated={async () => {
            setMessage('Report generated. It is available in download history.');
            await refreshReports();
          }}
        />
      </main>
    </div>
  );
}

function AuthScreen({ onSession }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: 'CA User', email: 'ca@example.com', password: 'password123' });
  const [error, setError] = useState('');

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
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand"><Building2 /> <strong>AuditExpress</strong><span>Professional Suite Authentication</span></div>
        {mode === 'signup' && <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
        <Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="error">{error}</p>}
        <button className="primary">{mode === 'login' ? 'Sign In' : 'Create Account'}</button>
        <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}

function CreateCompany({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', cin: '', registeredOffice: '' });
  async function submit(event) {
    event.preventDefault();
    const company = await api('/companies', { method: 'POST', body: JSON.stringify(form) });
    setOpen(false);
    setForm({ name: '', cin: '', registeredOffice: '' });
    onCreated(company);
  }
  return open ? (
    <form className="inline-form" onSubmit={submit}>
      <input placeholder="Company name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <input placeholder="CIN" value={form.cin} onChange={(event) => setForm({ ...form, cin: event.target.value })} />
      <button className="primary">Save</button>
    </form>
  ) : <button className="primary" onClick={() => setOpen(true)}><Plus size={16} /> Add Company</button>;
}

function CreatePeriod({ company, onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: 'FY 2025-26 Q1', periodType: 'quarterly', startDate: '2025-04-01', endDate: '2025-06-30' });
  async function submit(event) {
    event.preventDefault();
    const period = await api(`/companies/${company.id}/periods`, { method: 'POST', body: JSON.stringify(form) });
    setOpen(false);
    onCreated(period);
  }
  return open ? (
    <form className="inline-form" onSubmit={submit}>
      <input value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
      <select value={form.periodType} onChange={(event) => setForm({ ...form, periodType: event.target.value })}>
        <option value="monthly">Monthly</option>
        <option value="quarterly">Quarterly</option>
        <option value="half_yearly">Half-yearly</option>
        <option value="annual">Annual</option>
      </select>
      <button className="primary">Save</button>
    </form>
  ) : <button className="secondary" onClick={() => setOpen(true)}><Plus size={16} /> Add Period</button>;
}

function CompanyMetadata({ company, onSaved }) {
  const [form, setForm] = useState({});
  useEffect(() => {
    if (company) setForm({ ...company.metadata, name: company.name, cin: company.cin, registeredOffice: company.registeredOffice });
  }, [company?.id]);
  if (!company) return <Panel title="Company Metadata"><p className="muted">Create a company to begin.</p></Panel>;
  async function save(event) {
    event.preventDefault();
    await api(`/companies/${company.id}/metadata`, { method: 'PATCH', body: JSON.stringify(form) });
    onSaved();
  }
  return (
    <Panel title="Report Metadata">
      <form className="metadata-grid" onSubmit={save}>
        {['name', 'cin', 'registeredOffice', 'auditStatus', 'boardMeetingDate', 'paidUpCapital', 'faceValue', 'directorName', 'din', 'place'].map((key) => (
          <Field key={key} label={labelize(key)} value={form[key] || ''} onChange={(value) => setForm({ ...form, [key]: value })} />
        ))}
        <button className="primary">Save Metadata</button>
      </form>
    </Panel>
  );
}

function UploadTrialBalance({ period, onUploaded }) {
  const [file, setFile] = useState(null);
  async function submit(event) {
    event.preventDefault();
    if (!period || !file) return;
    const formData = new FormData();
    formData.append('trialBalance', file);
    const result = await api(`/periods/${period.id}/uploads`, { method: 'POST', body: formData, isForm: true });
    onUploaded(result);
  }
  return (
    <Panel title="Upload Trial Balance">
      <form className="upload-box" onSubmit={submit}>
        <Upload />
        <strong>Upload .xlsx trial balance</strong>
        <span>{period ? period.label : 'Select or create a reporting period first'}</span>
        <input type="file" accept=".xlsx,.xls,.xlsm" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button className="primary" disabled={!period || !file}>Parse and Map</button>
      </form>
    </Panel>
  );
}

function MappingTable({ mapping }) {
  const rows = useMemo(() => mapping.mappings.slice(0, 100), [mapping.mappings]);
  return (
    <Panel title="Ledger Mapping Review" actions={<span className="badge danger">{mapping.summary.unmapped} unmapped</span>}>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ledger</th><th>Amount</th><th>Schedule III Line</th><th>XBRL Element</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.status === 'unmapped' ? 'row-danger' : ''}>
                <td>{row.rawName}</td>
                <td className="num">{formatMoney(row.netAmount)}</td>
                <td>{row.scheduleLabel}</td>
                <td>{row.xbrlElement || '-'}</td>
                <td><span className={`badge ${row.status === 'unmapped' ? 'danger' : 'ok'}`}>{row.status}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5" className="empty">Upload a trial balance to view mappings.</td></tr>}
          </tbody>
        </table>
      </div>
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

createRoot(document.getElementById('root')).render(<App />);
