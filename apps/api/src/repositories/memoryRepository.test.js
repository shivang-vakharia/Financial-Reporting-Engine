import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRepository } from './memoryRepository.js';
import { store } from '../store/memoryStore.js';

test('memory repository persists company workflow entities through the storage contract', async () => {
  Object.keys(store).forEach((key) => {
    store[key] = [];
  });
  const repository = createMemoryRepository();
  const user = await repository.createUser({
    id: 'user-1',
    name: 'CA User',
    email: 'ca@example.com',
    passwordHash: 'hash',
    createdAt: new Date().toISOString()
  });
  assert.equal((await repository.findUserByEmail('CA@EXAMPLE.COM')).id, user.id);

  const company = await repository.createCompany({
    id: 'company-1',
    ownerId: user.id,
    name: 'Test Limited',
    cin: '',
    registeredOffice: '',
    reportingFramework: 'division_ii_ind_as',
    metadata: {},
    createdAt: new Date().toISOString()
  });
  assert.equal((await repository.listCompanies(user.id)).length, 1);

  const period = await repository.createPeriod({
    id: 'period-1',
    companyId: company.id,
    label: 'FY 2025-26 Q1',
    periodType: 'quarterly',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    financialYear: '2025-26',
    createdAt: new Date().toISOString()
  });
  const context = await repository.getPeriodForOwner(period.id, user.id);
  assert.equal(context.company.id, company.id);
});

