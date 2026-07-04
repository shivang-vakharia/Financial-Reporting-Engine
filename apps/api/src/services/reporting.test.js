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
  assert.ok(report.getWorksheet('Segment reoprt'));
  assert.ok(report.getWorksheet('Cash Flow'));
  assert.ok(report.getWorksheet('Changes in Equity'));
  assert.ok(report.getWorksheet('Unmapped Ledgers'));
  assert.equal(report.getWorksheet('Result').getCell('B9').value, 'Date of start of reporting period ');
  assert.equal(report.getWorksheet('Result').getCell('B12').value, 'Nature of report standalone or consolidated');
});
