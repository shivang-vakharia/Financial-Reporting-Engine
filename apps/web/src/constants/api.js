export const ENDPOINTS = {
  COMPANIES: '/companies',
  COMPANY_METADATA: (id) => `/companies/${id}/metadata`,
  COMPANY_PERIODS: (id) => `/companies/${id}/periods`,
  REPORT_RUNS_DOWNLOAD: (id) => `/report-runs/${id}/download`,
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup'
};
