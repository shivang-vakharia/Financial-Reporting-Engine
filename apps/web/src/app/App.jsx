import React, { useEffect, useState } from 'react';
import LandingPage from "../components/auth/LandingPage.jsx";
import useCompanies from "../hooks/useCompanies";
import usePeriods from "../hooks/usePeriods";
import useMapping from "../hooks/useMapping";
import useScheduleLines from '../hooks/useScheduleLines.js';
import useUploads from '../hooks/useUploads.js';
import useReports from '../hooks/useReports.js';

import CreateCompany from "../components/company/CreateCompany.jsx";
import CreatePeriod from "../components/period/CreatePeriod.jsx";

import HomePage from "../pages/HomePage.jsx";
import WorkspacePage from "../pages/WorkspacePage.jsx";
import ReportsPage from "../pages/ReportsPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";

import { VIEWS } from "../constants/routes.js";
import { NOTICES } from "../constants/messages.js";

import { deleteCompany as deleteCompanyApi } from "../services/companyService.js";
import { setAuthSession, clearAuthSession } from "../services/authService.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [message, setMessage] = useState("");

  // Load persisted session if Remember Me was checked
  useEffect(() => {
    const stored = localStorage.getItem('authSession');
    if (stored) {
      try {
        const payload = JSON.parse(stored);
        setAuthSession(payload);
        setSession(payload);
      } catch (e) {
        console.error('Failed to parse stored auth session', e);
        localStorage.removeItem('authSession');
      }
    }
  }, []);


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
        companyId && companyList.some(c => c.id === companyId)
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
      const periodList = await refreshPeriods(companyId);

      if (periodList.length === 0) {
        setPeriodId("");
        return;
      }

      if (!periodList.some(period => period.id === periodId)) {
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
    if (!id || !confirm(NOTICES.DELETE_COMPANY_CONFIRM)) {
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
    localStorage.removeItem('authSession');
    setSession(null);
  }

  if (!session?.token) {
    return (
      <LandingPage
        onSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
        onLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onSession={handleSession}
        showAuth={showAuthModal}
        authMode={authMode}
        onCloseAuth={() => setShowAuthModal(false)}
      />
    );
  }

  const renderPage = () => {
    switch (currentView) {
      case VIEWS.WORKSPACE:
        return (
          <WorkspacePage
            companies={companies}
            uploads={uploads}
            mapping={mapping}
            selectedCompany={selectedCompany}
            selectedPeriod={selectedPeriod}
            periods={periods}
            reports={reports}
            refreshCompanies={refreshCompanies}
            deleteCompany={deleteCompany}
            periodId={periodId}
            companyId={companyId}
            refreshMapping={refreshMapping}
            refreshUploads={refreshUploads}
            refreshReports={refreshReports}
            scheduleLines={scheduleLines}
            updateMappingResult={updateMappingResult}
            message={message}
            setMessage={setMessage}
          />
        );
      case VIEWS.REPORTS:
        return (
          <ReportsPage
            selectedCompany={selectedCompany}
            reports={reports}
          />
        );
      case VIEWS.SETTINGS:
        return (
          <SettingsPage
            session={session}
          />
        );
      case VIEWS.HOME:
      default:
        return (
          <HomePage
            companies={companies}
            uploads={uploads}
            mapping={mapping}
            selectedCompany={selectedCompany}
            refreshCompanies={refreshCompanies}
            setCompanyId={setCompanyId}
            refreshPeriods={refreshPeriods}
            setPeriodId={setPeriodId}
            setCurrentView={setCurrentView}
            companyId={companyId}
          />
        );
    }
  };

  const headerActions = currentView === VIEWS.WORKSPACE ? (
    <>
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
    </>
  ) : null;

  return (
    <DashboardLayout
      currentView={currentView}
      setCurrentView={setCurrentView}
      companyId={companyId}
      setCompanyId={setCompanyId}
      companies={companies}
      periodId={periodId}
      setPeriodId={setPeriodId}
      periods={periods}
      logout={logout}
      headerActions={headerActions}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
