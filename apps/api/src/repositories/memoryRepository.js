import { store } from '../store/memoryStore.js';

export function createMemoryRepository() {
  return {
    async findUserByEmail(email) {
      return store.users.find((user) => user.email.toLowerCase() === String(email || '').toLowerCase()) || null;
    },
    async createUser(user) {
      store.users.push(user);
      return user;
    },
    async listCompanies(ownerId) {
      return store.companies.filter((company) => company.ownerId === ownerId);
    },
    async createCompany(company) {
      store.companies.push(company);
      return company;
    },
    async getCompanyForOwner(companyId, ownerId) {
      return store.companies.find((company) => company.id === companyId && company.ownerId === ownerId) || null;
    },
    async updateCompany(companyId, ownerId, patch) {
      const company = await this.getCompanyForOwner(companyId, ownerId);
      if (!company) return null;
      Object.assign(company, patch);
      if (patch.metadata) company.metadata = { ...(company.metadata || {}), ...patch.metadata };
      return company;
    },
    async listPeriods(companyId) {
      return store.periods.filter((period) => period.companyId === companyId);
    },
    async createPeriod(period) {
      store.periods.push(period);
      return period;
    },
    async getPeriodForOwner(periodId, ownerId) {
      const period = store.periods.find((item) => item.id === periodId);
      if (!period) return null;
      const company = store.companies.find((item) => item.id === period.companyId && item.ownerId === ownerId);
      return company ? { period, company } : null;
    },
    async createUpload(upload) {
      store.uploads.push(upload);
      return upload;
    },
    async createLedgers(ledgers) {
      store.ledgers.push(...ledgers);
      return ledgers;
    },
    async listUploads(periodId) {
      return store.uploads.filter((upload) => upload.periodId === periodId);
    },
    async listLedgersByUpload(uploadId) {
      return store.ledgers.filter((ledger) => ledger.uploadId === uploadId);
    },
    async listLedgersByPeriod(periodId) {
      return store.ledgers.filter((ledger) => ledger.periodId === periodId);
    },
    async replaceMappingsForUpload(uploadId, mappings) {
      store.mappings = store.mappings.filter((mapping) => mapping.uploadId !== uploadId).concat(mappings);
      return mappings;
    },
    async replaceMappingsForPeriod(periodId, mappings) {
      store.mappings = store.mappings.filter((mapping) => mapping.periodId !== periodId).concat(mappings);
      return mappings;
    },
    async listMappingsByPeriod(periodId) {
      return store.mappings.filter((mapping) => mapping.periodId === periodId);
    },
    async createReportRun(reportRun) {
      store.reportRuns.push(reportRun);
      return reportRun;
    },
    async completeReportRun(reportRunId, patch) {
      const reportRun = store.reportRuns.find((run) => run.id === reportRunId);
      if (!reportRun) return null;
      Object.assign(reportRun, patch);
      return reportRun;
    },
    async listReportRunsForOwner(ownerId) {
      const companyIds = new Set(store.companies.filter((company) => company.ownerId === ownerId).map((company) => company.id));
      return store.reportRuns.filter((run) => companyIds.has(run.companyId));
    },
    async getReportRunForOwner(reportRunId, ownerId) {
      const run = store.reportRuns.find((item) => item.id === reportRunId);
      if (!run) return null;
      const company = store.companies.find((item) => item.id === run.companyId && item.ownerId === ownerId);
      return company ? run : null;
    },
    async listComparativePeriods(companyId, currentPeriodId) {
      return store.periods.filter((period) => period.companyId === companyId && period.id !== currentPeriodId).slice(-3);
    }
  };
}

