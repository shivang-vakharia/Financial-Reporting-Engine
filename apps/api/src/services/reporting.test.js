import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { parseTrialBalance } from './trialBalanceParser.js';
import { mapLedgers } from './mappingEngine.js';
import { generateReportWorkbook } from './reportGenerator.js';

test('parses, maps, and exports a trial balance workbook with unmapped ledgers', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fre-'));
  const inputPath = path.join(dir, 'trial-balance.xlsx');
  const outputPath = path.join(dir, 'report.xlsx');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Trial Balance');
  sheet.addRow(['Particulars', 'Closing Balance']);
  sheet.addRow(['', 'Debit', 'Credit']);
  sheet.addRow(['Equity Share Capital', '', 100000]);
  sheet.addRow(['Flat Sales', '', 250000]);
  sheet.addRow(['Salary Expense', 50000, '']);
  sheet.addRow(['Mystery Suspense Account', 1250, '']);
  sheet.addRow(['Current Liabilities', '', '']);
  sheet.addRow(['Fixed Assets', 5000, '']);
  sheet.addRow(['Grand Total', 51250, 350000]);
  await workbook.xlsx.writeFile(inputPath);

  const parsed = await parseTrialBalance(inputPath);
  assert.equal(parsed.ledgers.length, 5);

  const ledgers = parsed.ledgers.map((ledger, index) => ({
    ...ledger,
    id: `ledger-${index}`,
    uploadId: 'upload-1',
    periodId: 'period-1'
  }));
  const mappings = mapLedgers(ledgers);
  assert.equal(mappings.filter((item) => item.status === 'unmapped').length, 1);
  assert.equal(mappings.find((item) => item.rawName === 'Fixed Assets').scheduleLineId, 'ppe');

  await generateReportWorkbook({
    company: { name: 'Test Limited', cin: 'U00000GJ2026PLC000000', registeredOffice: 'Surat', metadata: {} },
    period: { id: 'period-1', label: 'FY 2025-26 Q1', periodType: 'quarterly', startDate: '2025-04-01', endDate: '2025-06-30' },
    reportRun: { id: 'run-1', reportType: 'standalone', metadata: {} },
    ledgers,
    mappings,
    outputPath,
    comparativePeriods: []
  });

  assert.equal(fs.existsSync(outputPath), true);
  const report = new ExcelJS.Workbook();
  await report.xlsx.readFile(outputPath);
  assert.ok(report.getWorksheet('Result'));
  assert.ok(report.getWorksheet('SLA'));
  assert.ok(report.getWorksheet('Segment report'));
  assert.ok(report.getWorksheet('Cash Flow'));
  assert.ok(report.getWorksheet('Changes in Equity'));
  assert.ok(report.getWorksheet('Unmapped Ledgers'));
  assert.equal(report.getWorksheet('Result').getCell('B9').value, 'Date of start of reporting period');
  assert.equal(report.getWorksheet('Result').getCell('B12').value, 'Nature of report standalone or consolidated');
});

test('maps common ledger names to Schedule III line items', () => {
  const ledgers = [
    { id: 'ledger-1', uploadId: 'upload-1', periodId: 'period-1', rawName: 'Accounts Payable', debitAmount: 0, creditAmount: 120000, netAmount: -120000 },
    { id: 'ledger-2', uploadId: 'upload-1', periodId: 'period-1', rawName: 'Term Loan', debitAmount: 0, creditAmount: 300000, netAmount: -300000 },
    { id: 'ledger-3', uploadId: 'upload-1', periodId: 'period-1', rawName: 'Accounts Receivable', debitAmount: 150000, creditAmount: 0, netAmount: 150000 },
    { id: 'ledger-4', uploadId: 'upload-1', periodId: 'period-1', rawName: 'Raw Material Purchase', debitAmount: 80000, creditAmount: 0, netAmount: 80000 },
    { id: 'ledger-5', uploadId: 'upload-1', periodId: 'period-1', rawName: 'Bank Charges', debitAmount: 2500, creditAmount: 0, netAmount: 2500 },
    { id: 'ledger-6', uploadId: 'upload-1', periodId: 'period-1', rawName: 'Finance Costs', debitAmount: 15000, creditAmount: 0, netAmount: 15000 }
  ];

  const mappings = mapLedgers(ledgers);
  assert.equal(mappings.find((item) => item.rawName === 'Accounts Payable').scheduleLineId, 'trade_payables');
  assert.equal(mappings.find((item) => item.rawName === 'Term Loan').scheduleLineId, 'borrowings_non_current');
  assert.equal(mappings.find((item) => item.rawName === 'Accounts Receivable').scheduleLineId, 'trade_receivables');
  assert.equal(mappings.find((item) => item.rawName === 'Raw Material Purchase').scheduleLineId, 'materials_consumed');
  assert.equal(mappings.find((item) => item.rawName === 'Bank Charges').scheduleLineId, 'finance_costs');
  assert.equal(mappings.find((item) => item.rawName === 'Finance Costs').scheduleLineId, 'finance_costs');
});

test('generates result workbook with comparative period values in the correct columns', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fre-'));
  const currentPath = path.join(dir, 'current.xlsx');
  const priorPath = path.join(dir, 'prior.xlsx');
  const outputPath = path.join(dir, 'comparative-report.xlsx');

  const currentWorkbook = new ExcelJS.Workbook();
  const currentSheet = currentWorkbook.addWorksheet('Trial Balance');
  currentSheet.addRow(['Particulars', 'Closing Balance']);
  currentSheet.addRow(['', 'Debit', 'Credit']);
  currentSheet.addRow(['Flat Sales', '', 250000]);
  currentSheet.addRow(['Salary Expense', 50000, '']);
  currentSheet.addRow(['Equity Share Capital', '', 100000]);
  await currentWorkbook.xlsx.writeFile(currentPath);

  const priorWorkbook = new ExcelJS.Workbook();
  const priorSheet = priorWorkbook.addWorksheet('Trial Balance');
  priorSheet.addRow(['Particulars', 'Closing Balance']);
  priorSheet.addRow(['', 'Debit', 'Credit']);
  priorSheet.addRow(['Flat Sales', '', 120000]);
  priorSheet.addRow(['Salary Expense', 25000, '']);
  priorSheet.addRow(['Equity Share Capital', '', 90000]);
  await priorWorkbook.xlsx.writeFile(priorPath);

  const currentParsed = await parseTrialBalance(currentPath);
  const priorParsed = await parseTrialBalance(priorPath);

  const currentLedgers = currentParsed.ledgers.map((ledger, index) => ({
    ...ledger,
    id: `current-${index}`,
    uploadId: 'upload-current',
    periodId: 'period-current'
  }));
  const priorLedgers = priorParsed.ledgers.map((ledger, index) => ({
    ...ledger,
    id: `prior-${index}`,
    uploadId: 'upload-prior',
    periodId: 'period-prior'
  }));

  const currentMappings = mapLedgers(currentLedgers);
  const priorMappings = mapLedgers(priorLedgers);

  await generateReportWorkbook({
    company: { name: 'Test Limited', cin: 'U00000GJ2026PLC000000', registeredOffice: 'Surat', metadata: {} },
    period: { id: 'period-current', label: 'FY 2025-26 Q1', periodType: 'quarterly', startDate: '2025-04-01', endDate: '2025-06-30' },
    reportRun: { id: 'run-2', reportType: 'standalone', metadata: {} },
    ledgers: currentLedgers,
    mappings: currentMappings,
    comparativePeriods: [{ id: 'period-prior', label: 'FY 2025-26 Q4', periodType: 'quarterly', startDate: '2025-01-01', endDate: '2025-03-31' }],
    comparativeMappings: priorMappings,
    outputPath
  });

  const report = new ExcelJS.Workbook();
  await report.xlsx.readFile(outputPath);
  const resultSheet = report.getWorksheet('Result');

  assert.equal(resultSheet.getCell('C13').value, 250000);
  assert.equal(resultSheet.getCell('D13').value, 120000);
  assert.equal(resultSheet.getCell('F13').value, 250000);
  assert.equal(resultSheet.getCell('G13').value, 120000);
});
