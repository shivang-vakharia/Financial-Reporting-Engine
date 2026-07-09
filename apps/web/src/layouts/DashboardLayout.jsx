import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Settings,
  LogOut
} from "lucide-react";
import { VIEWS } from "../constants/routes.js";

export default function DashboardLayout({
  currentView,
  setCurrentView,
  companyId,
  setCompanyId,
  companies,
  periodId,
  setPeriodId,
  periods,
  logout,
  children,
  headerActions
}) {
  const getHeaderInfo = () => {
    switch (currentView) {
      case VIEWS.WORKSPACE:
        return {
          subtitle: 'Workspace / Ind AS Schedule III / Financial Results',
          title: 'Financial Reporting Workspace'
        };
      case VIEWS.REPORTS:
        return {
          subtitle: 'Reports / Download history',
          title: 'Report Library'
        };
      case VIEWS.SETTINGS:
        return {
          subtitle: 'Settings and preferences',
          title: 'Settings'
        };
      case VIEWS.HOME:
      default:
        return {
          subtitle: 'Welcome to your financial reporting workspace',
          title: 'Welcome back'
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

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
          <button
            type="button"
            className={currentView === VIEWS.HOME ? 'active' : ''}
            onClick={() => setCurrentView(VIEWS.HOME)}
          >
            <LayoutDashboard size={18} /> Home
          </button>
          <button
            type="button"
            className={currentView === VIEWS.WORKSPACE ? 'active' : ''}
            onClick={() => setCurrentView(VIEWS.WORKSPACE)}
          >
            <FileSpreadsheet size={18} /> Workspace
          </button>
          <button
            type="button"
            className={currentView === VIEWS.REPORTS ? 'active' : ''}
            onClick={() => setCurrentView(VIEWS.REPORTS)}
          >
            <FileSpreadsheet size={18} /> Reports
          </button>
          <button
            type="button"
            className={currentView === VIEWS.SETTINGS ? 'active' : ''}
            onClick={() => setCurrentView(VIEWS.SETTINGS)}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <strong>AuditExpress</strong>
          <div className="topbar-controls">
            <select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            <select value={periodId} onChange={(event) => setPeriodId(event.target.value)}>
              <option value="">Select period</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
            <button className="ghost" onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </header>

        <section className="page-header">
          <div>
            <p>{subtitle}</p>
            <h1>{title}</h1>
          </div>
          {headerActions && <div className="actions">{headerActions}</div>}
        </section>

        {children}
      </main>
    </div>
  );
}
