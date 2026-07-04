import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

  const periodByIds = await repository.listPeriodsByIds(company.id, [period.id]);
  assert.equal(periodByIds.length, 1);

  store.mappings.push({
    id: 'mapping-1',
    uploadId: 'upload-1',
    periodId: period.id,
    ledgerEntryId: 'ledger-1',
    rawName: 'Fixed Assets',
    netAmount: 10000,
    status: 'mapped',
    scheduleLineId: 'ppe',
    scheduleLabel: 'Property, Plant and Equipment',
    statement: 'balance_sheet',
    section: 'Non-current Assets',
    xbrlElement: 'in-gaap:PropertyPlantAndEquipment',
    mappingSource: 'rule',
    confidenceLabel: 'rule'
  });
  const mappingsByIds = await repository.listMappingsByPeriodIds([period.id]);
  assert.equal(mappingsByIds.length, 1);

  const storagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../storage/memory-store.json');
  const persisted = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  assert.equal(persisted.companies[0].id, company.id);
  assert.equal(persisted.periods[0].id, period.id);
});

