import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { parseTrialBalance } from '../apps/api/src/services/trialBalanceParser.js';
import { mapLedgers } from '../apps/api/src/services/mappingEngine.js';
import { generateReportWorkbook } from '../apps/api/src/services/reportGenerator.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const samplesDir = path.join(rootDir, 'samples');
const trialBalanceDir = path.join(samplesDir, 'trial-balance');
const expectedReportDir = path.join(samplesDir, 'expected-report');

async function ensureDirs() {
  await fs.mkdir(trialBalanceDir, { recursive: true });
  await fs.mkdir(expectedReportDir, { recursive: true });
}

function buildWorkbook(rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Trial Balance');
  rows.forEach((row) => sheet.addRow(row));
  return workbook;
}

const trialBalances = [
  {
    fileName: 'TB-Q1-2025-26.xlsx',
    label: 'FY 2025-26 Q1',
    periodType: 'quarterly',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    rows: [
      ['Particulars', 'Debit', 'Credit'],
      ['Equity and Liabilities', '', ''],
      ['Equity Share Capital', '', 100000],
      ['Other Equity', '', 50000],
      ['Liabilities', '', ''],
      ['Trade Payables', '', 30000],
      ['Borrowings', '', 20000],
      ['Current Tax Payable', '', 5000],
      ['Assets', '', ''],
      ['Fixed Assets', 150000, ''],
      ['Inventory', 20000, ''],
      ['Bank Account', 25000, ''],
      ['Deposit Asset', 10000, ''],
      ['Flat Sales', '', 85000],
      ['Other Income', '', 17500],
      ['Material Consumed', 50000, ''],
      ['Salary Expense', 40000, ''],
      ['Finance Costs', 5000, ''],
      ['Depreciation', 3000, ''],
      ['Tax Expense', 12500, ''],
      ['Secret Suspense Account', 5000, '']
    ]
  },
  {
    fileName: 'TB-Q4-2024-25.xlsx',
    label: 'FY 2024-25 Q4',
    periodType: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    rows: [
      ['Particulars', 'Debit', 'Credit'],
      ['Revenue', '', ''],
      ['Flat Sales', '', 70000],
      ['Other Income', '', 5000],
      ['Expenses', '', ''],
      ['Material Consumed', 35000, ''],
      ['Salary Expense', 28000, ''],
      ['Finance Costs', 2000, ''],
      ['Depreciation', 1500, ''],
      ['Tax Expense', 7500, ''],
      ['Assets', '', ''],
      ['Bank Account', 30000, ''],
      ['Deposit Asset', 8000, ''],
      ['Inventory', 15000, ''],
      ['Liabilities', '', ''],
      ['Trade Payables', '', 25000],
      ['Borrowings', '', 15000],
      ['Equity Share Capital', '', 100000],
      ['Other Equity', '', 5000]
    ]
  },
  {
    fileName: 'TB-Annual-2024-25.xlsx',
    label: 'FY 2024-25 Annual',
    periodType: 'annual',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    rows: [
      ['Particulars', 'Debit', 'Credit'],
      ['Income', '', ''],
      ['Flat Sales', '', 300000],
      ['Other Income', '', 25000],
      ['Expenses', '', ''],
      ['Material Consumed', 120000, ''],
      ['Salary Expense', 90000, ''],
      ['Finance Costs', 15000, ''],
      ['Depreciation', 9000, ''],
      ['Tax Expense', 30000, ''],
      ['Assets', '', ''],
      ['Fixed Assets', 180000, ''],
      ['Inventory', 35000, ''],
      ['Bank Account', 50000, ''],
      ['Deposit Asset', 20000, ''],
      ['Liabilities', '', ''],
      ['Trade Payables', '', 45000],
      ['Borrowings', '', 25000],
      ['Equity Share Capital', '', 100000],
      ['Other Equity', '', 50000]
    ]
  }
];

function normalizeId(label) {
  return label.replace(/\s+/g, '_');
}

async function run() {
  await ensureDirs();

  const fixtures = [];
  for (const tb of trialBalances) {
    const workbook = buildWorkbook(tb.rows);
    const outputPath = path.join(trialBalanceDir, tb.fileName);
    await workbook.xlsx.writeFile(outputPath);
    fixtures.push({ ...tb, path: outputPath, periodId: normalizeId(tb.label) });
  }

  const sampleData = {};
  for (const fixture of fixtures) {
    const parsed = await parseTrialBalance(fixture.path);
    const ledgers = parsed.ledgers.map((ledger, index) => ({
      ...ledger,
      id: `${fixture.periodId}-ledger-${index}`,
      uploadId: `${fixture.periodId}-upload`,
      periodId: fixture.periodId
    }));
    sampleData[fixture.label] = {
      fixture,
      ledgers,
      mappings: mapLedgers(ledgers)
    };
  }

  const current = sampleData['FY 2025-26 Q1'];
  const reportMetadata = {
    reportType: 'standalone',
    auditStatus: 'Unaudited',
    boardMeetingDate: '2025-07-15',
    paidUpCapital: '100000',
    faceValue: '10',
    directorName: 'Amit Desai',
    din: '01234567',
    place: 'Surat'
  };

  await generateReportWorkbook({
    company: {
      name: 'Test Limited',
      cin: 'U00000GJ2026PLC000000',
      registeredOffice: 'Surat',
      metadata: reportMetadata
    },
    period: {
      id: current.fixture.periodId,
      label: current.fixture.label,
      periodType: current.fixture.periodType,
      startDate: current.fixture.startDate,
      endDate: current.fixture.endDate
    },
    reportRun: {
      id: 'report-current-1',
      reportType: 'standalone',
      metadata: reportMetadata
    },
    ledgers: current.ledgers,
    mappings: current.mappings,
    comparativePeriods: [],
    comparativeMappings: [],
    outputPath: path.join(expectedReportDir, 'ideal-current-quarter-report.xlsx')
  });

  const comparativePeriods = [sampleData['FY 2024-25 Q4'], sampleData['FY 2024-25 Annual']];
  await generateReportWorkbook({
    company: {
      name: 'Test Limited',
      cin: 'U00000GJ2026PLC000000',
      registeredOffice: 'Surat',
      metadata: reportMetadata
    },
    period: {
      id: current.fixture.periodId,
      label: current.fixture.label,
      periodType: current.fixture.periodType,
      startDate: current.fixture.startDate,
      endDate: current.fixture.endDate
    },
    reportRun: {
      id: 'report-current-2',
      reportType: 'standalone',
      metadata: reportMetadata
    },
    ledgers: current.ledgers,
    mappings: current.mappings,
    comparativePeriods: [
      {
        id: sampleData['FY 2024-25 Q4'].fixture.periodId,
        label: sampleData['FY 2024-25 Q4'].fixture.label,
        periodType: sampleData['FY 2024-25 Q4'].fixture.periodType,
        startDate: sampleData['FY 2024-25 Q4'].fixture.startDate,
        endDate: sampleData['FY 2024-25 Q4'].fixture.endDate
      },
      {
        id: sampleData['FY 2024-25 Annual'].fixture.periodId,
        label: sampleData['FY 2024-25 Annual'].fixture.label,
        periodType: sampleData['FY 2024-25 Annual'].fixture.periodType,
        startDate: sampleData['FY 2024-25 Annual'].fixture.startDate,
        endDate: sampleData['FY 2024-25 Annual'].fixture.endDate
      }
    ],
    comparativeMappings: [
      ...sampleData['FY 2024-25 Q4'].mappings,
      ...sampleData['FY 2024-25 Annual'].mappings
    ],
    outputPath: path.join(expectedReportDir, 'ideal-current-quarter-report-with-comparatives.xlsx')
  });

  console.log('Sample trial balance files and expected reports generated in', samplesDir);
}

run().catch((error) => {
  console.error('Failed to generate sample fixtures:', error);
  process.exit(1);
});
