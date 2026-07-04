import ExcelJS from 'exceljs';

const MONEY_FORMAT = '#,##0.00;[Red](#,##0.00);-';

export async function generateReportWorkbook({ company, period, reportRun, ledgers, mappings, outputPath, comparativePeriods }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Financial Reporting Engine';
  workbook.created = new Date();

  const mapped = mappings.filter((item) => item.status === 'mapped');
  const unmapped = mappings.filter((item) => item.status === 'unmapped');
  const totals = aggregate(mapped);

  addResultSheet(workbook, company, period, reportRun, totals, unmapped, comparativePeriods);
  addSlaSheet(workbook, company, period, reportRun, totals, unmapped, comparativePeriods);
  addSegmentSheet(workbook, company, period, reportRun);
  addCashFlow(workbook, company, period, reportRun, totals);
  addChangesInEquity(workbook, company, period, reportRun, totals);
  addNotes(workbook, company, period, reportRun);
  addXbrlMapping(workbook, mapped);
  addUnmapped(workbook, unmapped, ledgers);

  await workbook.xlsx.writeFile(outputPath);
}

function addResultSheet(workbook, company, period, reportRun, totals, unmapped, comparativePeriods) {
  const ws = workbook.addWorksheet('Result');
  const metadata = reportMetadata(company, period, reportRun);
  setupResultColumns(ws);

  mergeValue(ws, 'A1:H1', company.name, 'title');
  mergeValue(ws, 'A2:H2', `CIN: ${company.cin || 'Not specified'}`, 'meta');
  mergeValue(ws, 'A3:H3', `Registered Office: ${company.registeredOffice || 'Not specified'}`, 'meta');
  mergeValue(ws, 'A5:H5', `Statement of Financial Results for the ${periodLabel(period)} ended on ${displayDate(period.endDate)}`, 'heading');
  mergeValue(ws, 'A6:H6', '(Amount in actuals except per share data)', 'meta');

  ws.mergeCells('A7:B7');
  ws.getCell('A7').value = 'Particulars';
  ws.mergeCells('C7:E7');
  ws.getCell('C7').value = periodGroupLabel(period);
  ws.mergeCells('F7:G7');
  ws.getCell('F7').value = 'Period ended';
  ws.getCell('H7').value = 'Year Ended';

  const periods = buildDisplayPeriods(period, comparativePeriods);
  setRow(ws, 8, ['', '', periods[0].end, periods[1].end, periods[2].end, periods[0].end, periods[2].end, periods[3].end]);
  setRow(ws, 9, ['A', 'Date of start of reporting period ', periods[0].start, periods[1].start, periods[2].start, periods[0].start, periods[2].start, periods[3].start]);
  setRow(ws, 10, ['B', 'Date of end of reporting period', { formula: 'C8' }, { formula: 'D8' }, { formula: 'E8' }, { formula: 'F8' }, { formula: 'G8' }, { formula: 'H8' }]);
  setRow(ws, 11, ['C', 'Whether results are audited or unaudited', metadata.auditStatus, metadata.auditStatus, metadata.auditStatus, metadata.auditStatus, metadata.auditStatus, metadata.auditStatus]);
  setRow(ws, 12, ['D', 'Nature of report standalone or consolidated', metadata.reportNature, metadata.reportNature, metadata.reportNature, metadata.reportNature, metadata.reportNature, metadata.reportNature]);

  const revenue = credit(totals.revenue_operations);
  const otherIncome = credit(totals.other_income);
  const expenses = {
    materials: debit(totals.materials_consumed),
    purchases: debit(totals.stock_trade_purchase),
    employees: debit(totals.employee_benefits),
    finance: debit(totals.finance_costs),
    depreciation: debit(totals.depreciation),
    other: debit(totals.other_expenses)
  };
  const tax = debit(totals.tax_expense);

  addResultLine(ws, 13, 'I', 'Revenue From Operations', revenue);
  addResultLine(ws, 14, 'II', 'Other Income', otherIncome);
  addFormulaLine(ws, 15, 'III', 'Total Income (I + II)', 'C13+C14');
  addResultLine(ws, 16, 'IV', 'Expenses', '');
  addResultLine(ws, 17, '(a)', 'Cost of materials consumed', expenses.materials);
  addResultLine(ws, 18, '(b)', 'Purchases of stock-in-trade', expenses.purchases);
  addResultLine(ws, 19, '(c)', 'Changes in inventories of finished goods, work-in-progress and stock-in-trade', 0);
  addResultLine(ws, 20, '(d)', 'Employee benefit expense ', expenses.employees);
  addResultLine(ws, 21, '(e)', 'Finance Costs', expenses.finance);
  addResultLine(ws, 22, '(f)', 'Depreciation and amortisation expense', expenses.depreciation);
  addResultLine(ws, 23, '(g)', 'Other Expenses', expenses.other);
  addResultLine(ws, 24, '(h)', '(Disclosed each and every item that is being included in Other Expenses and is more than 10% of the Total Expense)', '');
  addFormulaLine(ws, 25, '', 'Total expenses (IV)', 'SUM(C17:C24)');
  addFormulaLine(ws, 26, 'V', 'Profit/(loss) before exceptional and extraordinary items and tax (III-IV)', 'C15-C25');
  addResultLine(ws, 27, 'VI', 'Exceptional items ', 0);
  addFormulaLine(ws, 28, 'VII', 'Profit before extraordinary items and tax (V - VI)', 'C26-C27');
  addResultLine(ws, 29, 'VIII', 'Extraordinary items', 0);
  addFormulaLine(ws, 30, 'IX', 'Profit before tax (VII- VIII)', 'C28-C29');
  addResultLine(ws, 31, 'X', 'Tax Expense', '');
  addResultLine(ws, 32, '(a)', 'Current Tax ', tax);
  addResultLine(ws, 33, '(b)', '(Less):- MAT Credit ', 0);
  addResultLine(ws, 34, '(c)', 'Current Tax Expense Relating to Prior years', 0);
  addResultLine(ws, 35, '(d)', 'Deferred Tax (Asset)/Liabilities', 0);
  addFormulaLine(ws, 36, 'XI', 'Profit (Loss) for the period from continuing operations (IX-X)', 'C30-C32-C33-C34-C35');
  addResultLine(ws, 37, 'XII', 'Profit/(loss) from discontinued operations before tax', 0);
  addResultLine(ws, 38, 'XIII', 'Tax expenses of discontinued operations', 0);
  addFormulaLine(ws, 39, 'XIV', 'Profit/(loss) from Discontinued operations (after tax) (XII-XIII)', 'C37-C38');
  addFormulaLine(ws, 40, 'XV', 'Profit (Loss) for the period before minority interest (XI + XIV)', 'C36+C39');
  addResultLine(ws, 41, 'XVI', 'Share of Profit (Loss) of Associates', 0);
  addResultLine(ws, 42, 'XVII', 'Profit (Loss) of Minority Interest', 0);
  addFormulaLine(ws, 43, 'XVIII', 'Net Profit (Loss) for the period (XV+XVI-XVII)', 'C40+C41-C42');
  addResultLine(ws, 44, 'XIX', 'Details of equity share capital', '');
  addResultLine(ws, 45, '', 'Paid-up equity share capital', numberValue(metadata.paidUpCapital));
  setFormulaAcross(ws, 46, ['', 'Face value of equity share capital (Per Share)', metadata.faceValue || 'Not specified']);
  addResultLine(ws, 47, 'XX', 'Details of Debt Securities', '');
  addResultLine(ws, 48, '', 'Reserves excluding Revaluaton Reserve', credit(totals.other_equity));
  addResultLine(ws, 49, 'XXI', 'Earnings per share', '');
  setFormulaAcross(ws, 50, ['', 'Earnings per share (not annualised for half year / Period ended)', '']);
  addFormulaLine(ws, 51, '', 'Basic earnings (loss) per share from continuing and discotinued operations', 'IF(C45=0,0,C43/(C45/10))');
  addFormulaLine(ws, 52, '', 'Diluted earnings (loss) per share continuing and discotinued operations', 'C51');

  ws.addRow([]);
  ws.addRow(['Notes on Financial Results:-']);
  addNoteRows(ws, metadata, 55);
  const signRow = 64;
  ws.getCell(`H${signRow}`).value = `For, ${company.name}`;
  ws.getCell(`H${signRow + 4}`).value = metadata.directorName;
  ws.getCell(`A${signRow + 5}`).value = `Date : ${metadata.boardMeetingDate}`;
  ws.getCell(`H${signRow + 5}`).value = 'Director';
  ws.getCell(`A${signRow + 6}`).value = `Place:- ${metadata.place}`;
  ws.getCell(`H${signRow + 6}`).value = `DIN: ${metadata.din}`;

  addUnmappedAtBottom(ws, unmapped, signRow + 8, 8);
  formatResultSheet(ws);
}

function addSlaSheet(workbook, company, period, reportRun, totals, unmapped, comparativePeriods) {
  const ws = workbook.addWorksheet('SLA');
  setupSlaColumns(ws);
  const metadata = reportMetadata(company, period, reportRun);
  const periods = buildDisplayPeriods(period, comparativePeriods);

  mergeValue(ws, 'A1:E1', company.name, 'title');
  mergeValue(ws, 'A2:E2', `CIN: ${company.cin || 'Not specified'}`, 'meta');
  mergeValue(ws, 'A3:E3', `Registered Office: ${company.registeredOffice || 'Not specified'}`, 'meta');
  ws.getCell('E5').value = '(Amount in actuals)';
  mergeValue(ws, 'A6:E6', `${titleCase(metadata.reportNature)} Statement of Assets and Liabilities`, 'heading');
  setRow(ws, 7, ['', 'Particulars', `As at\n${periods[0].end}`, `As at\n${periods[1].end}`, `As at\n${periods[2].end}`]);
  setRow(ws, 8, ['', '', metadata.auditStatus, metadata.auditStatus, metadata.auditStatus]);

  addSlaLine(ws, 9, 'A', 'ASSETS', '');
  addSlaLine(ws, 10, '1', 'Non-current assets', '');
  addSlaLine(ws, 11, '', '(a)  Property, Plant and Equipment', debit(totals.ppe));
  addSlaLine(ws, 12, '', '(b)  Capital Work-In-Progress', 0);
  addSlaLine(ws, 13, '', '(c)  Investment Properties', 0);
  addSlaLine(ws, 14, '', '(d) Goodwill', 0);
  addSlaLine(ws, 15, '', '(e) Other Intangible Assets', 0);
  addSlaLine(ws, 16, '', '(f) Intangible Assets under Development', 0);
  addSlaLine(ws, 17, '', '(g) Financial Assets', '');
  addSlaLine(ws, 18, '', 'i. Investments', debit(totals.investments));
  addSlaLine(ws, 19, '', 'ii. Trade Receivables', 0);
  addSlaLine(ws, 20, '', 'iii. Loan', debit(totals.loans_assets));
  addSlaLine(ws, 21, '', 'iv. Other Financial Assets', 0);
  addSlaLine(ws, 22, '', '(h) Deferred tax Assets (net)', 0);
  addSlaLine(ws, 23, '', '(i) Other Non-Current Assets', 0);
  addSlaFormula(ws, 24, '', 'Total Non-Current Assets', 'SUM(C11:C23)');
  addSlaLine(ws, 26, '2', 'Current assets', '');
  addSlaLine(ws, 27, '', '(a) Inventories', debit(totals.inventories));
  addSlaLine(ws, 28, '', '(b) Financial Assets', '');
  addSlaLine(ws, 29, '', 'i. Investments', 0);
  addSlaLine(ws, 30, '', 'ii. Trade Receivables', debit(totals.trade_receivables));
  addSlaLine(ws, 31, '', 'iii. Cash and cash Equivalents', debit(totals.cash_equivalents));
  addSlaLine(ws, 32, '', 'iv. Bank balance other than(iii) above', debit(totals.bank_balances));
  addSlaLine(ws, 33, '', 'v. Loan', 0);
  addSlaLine(ws, 34, '', '(c) Current tax assets (net)', 0);
  addSlaLine(ws, 35, '', '(d) Other Current Assets', debit(totals.other_current_assets));
  addSlaFormula(ws, 36, '', 'Total Current Assets', 'SUM(C27:C35)');
  addSlaFormula(ws, 37, '', 'Total Assets(1+2)', 'C24+C36');

  addSlaLine(ws, 39, 'B', 'EQUITY AND LIABILITIES', '');
  addSlaLine(ws, 40, '', 'Equity', '');
  addSlaLine(ws, 41, '', '(a) Equity Share Capital', credit(totals.equity_share_capital));
  addSlaLine(ws, 42, '', '(b) Other equity', credit(totals.other_equity));
  addSlaFormula(ws, 43, '', 'Total Equity', 'SUM(C41:C42)');
  addSlaLine(ws, 45, '', 'Liabilities', '');
  addSlaLine(ws, 46, '', 'Non Current liabilities', '');
  addSlaLine(ws, 47, '', '(a) Financial liabilities', '');
  addSlaLine(ws, 48, '', 'i. Borrowings', credit(totals.borrowings_non_current));
  addSlaLine(ws, 49, '', 'ii. Trade Payables', 0);
  addSlaLine(ws, 50, '', 'iii. Other Financial Liabilities', 0);
  addSlaLine(ws, 51, '', '(b) Provision', 0);
  addSlaLine(ws, 52, '', '(c) Deferred tax liabilities (net)', 0);
  addSlaLine(ws, 53, '', '(d) Other Non-Current liabilities', 0);
  addSlaFormula(ws, 54, '', 'Total Non-Current liabilities', 'SUM(C47:C53)');
  addSlaLine(ws, 56, '', 'Current Liabilities', '');
  addSlaLine(ws, 57, '', '(a) Financial liabilities', '');
  addSlaLine(ws, 58, '', 'i. Borrowings', credit(totals.borrowings_current));
  addSlaLine(ws, 59, '', 'ii. Financial payable', '');
  addSlaLine(ws, 60, '', 'a. Total outstanding Dues of Micro enterprises and small enterprises', 0);
  addSlaLine(ws, 61, '', 'b. Total outstanding Dues of Creditors other than Micro enterprise and small enterprises', credit(totals.trade_payables));
  addSlaLine(ws, 62, '', 'iii. Other Financial liabilities', 0);
  addSlaLine(ws, 63, '', '(b) Provisions', 0);
  addSlaLine(ws, 64, '', '(c) Current tax liabilities', 0);
  addSlaLine(ws, 65, '', '(d) Other Liabilities', credit(totals.other_current_liabilities));
  addSlaFormula(ws, 66, '', 'Total Current liabilities', 'SUM(C57:C65)');
  addSlaFormula(ws, 67, '', 'Total Equity and liabilities', 'C43+C54+C66');
  addSlaFormula(ws, 68, '', 'Check', 'C67-C37');

  addUnmappedAtBottom(ws, unmapped, 70, 5);
  formatSlaSheet(ws);
}

function addSegmentSheet(workbook, company, period, reportRun) {
  const ws = workbook.addWorksheet('Segment reoprt');
  const metadata = reportMetadata(company, period, reportRun);
  setupResultColumns(ws);
  mergeValue(ws, 'A2:F2', `${metadata.auditStatus.toUpperCase()} ${metadata.reportNature.toUpperCase()} SEGMENT INFORMATION FOR ${periodGroupLabel(period).toUpperCase()} ${displayDate(period.endDate)}`, 'title');
  mergeValue(ws, 'A4:F4', '(Amount in actuals)', 'meta');
  setRow(ws, 5, ['Particulars', '', periodGroupLabel(period), '', '', 'YEAR ENDED']);
  setRow(ws, 6, ['', '', displayDate(period.endDate), '', '', displayDate(period.endDate)]);
  setRow(ws, 7, ['A', 'Date of start of reporting quarter ', displayDate(period.startDate), '', '', displayDate(period.startDate)]);
  setRow(ws, 8, ['B', 'Date of end of reporting quarter ', displayDate(period.endDate), '', '', displayDate(period.endDate)]);
  setRow(ws, 9, ['C', 'Whether results are audited or unaudited', metadata.auditStatus, '', '', metadata.auditStatus]);
  setRow(ws, 10, ['D', 'Nature of report standalone or consolidated', `${metadata.reportNature}/${periodLabel(period)}`, '', '', `${metadata.reportNature}/ Year Ended`]);
  addSlaLine(ws, 12, '1', 'Segment Revenue', '');
  addSlaLine(ws, 13, '', 'Primary Segment', 0);
  addSlaFormula(ws, 14, '', 'Revenue from Operation', 'C13');
  addSlaLine(ws, 16, '2', 'Segment Results', '');
  addSlaLine(ws, 17, '', 'Primary Segment', 0);
  addSlaFormula(ws, 18, '', 'Profit before Tax', 'C17');
  addSlaLine(ws, 20, '3', 'Segment Assets', '');
  addSlaLine(ws, 21, '', 'Unallocated', 0);
  addSlaFormula(ws, 22, '', 'Total Segment Assets', 'C21');
  addSlaLine(ws, 24, '4', 'Segment Liabilities', '');
  addSlaLine(ws, 25, '', 'Unallocated', 0);
  addSlaFormula(ws, 26, '', 'Total Segment Liabilities', 'C25');
  formatSlaSheet(ws);
}

function addCashFlow(workbook, company, period, reportRun, totals) {
  const ws = workbook.addWorksheet('Cash Flow');
  title(ws, company, period, reportRun, 'Statement of Cash Flows');
  ws.addRow([]);
  ws.addRow(['', 'Particulars', 'Current Period']);
  const profitBeforeTax = credit(totals.revenue_operations) + credit(totals.other_income) - expenseTotal(totals);
  addLine(ws, 'A', 'Cash flows from operating activities', '');
  addLine(ws, '', 'Profit before tax', profitBeforeTax);
  addLine(ws, '', 'Adjustments for depreciation and amortisation', debit(totals.depreciation));
  addLine(ws, '', 'Finance costs', debit(totals.finance_costs));
  addLine(ws, '', 'Operating profit before working capital changes', profitBeforeTax + debit(totals.depreciation) + debit(totals.finance_costs));
  addLine(ws, 'B', 'Cash flows from investing activities', '');
  addLine(ws, '', 'Purchase / sale of property, plant and equipment', -debit(totals.ppe));
  addLine(ws, 'C', 'Cash flows from financing activities', '');
  addLine(ws, '', 'Borrowings and finance costs', credit(totals.borrowings_current) - debit(totals.finance_costs));
  addLine(ws, '', 'Cash and cash equivalents at period end', debit(totals.cash_equivalents) + debit(totals.bank_balances));
  formatSupportSheet(ws);
}

function addChangesInEquity(workbook, company, period, reportRun, totals) {
  const ws = workbook.addWorksheet('Changes in Equity');
  title(ws, company, period, reportRun, 'Statement of Changes in Equity');
  ws.addRow([]);
  ws.addRow(['Particulars', 'Equity Share Capital', 'Other Equity', 'Total']);
  const capital = credit(totals.equity_share_capital);
  const other = credit(totals.other_equity);
  ws.addRow(['Balance at beginning of reporting period', '', '', '']);
  ws.addRow(['Changes during the period', capital, other, capital + other]);
  ws.addRow(['Balance at end of reporting period', capital, other, capital + other]);
  formatSupportSheet(ws);
}

function addNotes(workbook, company, period, reportRun) {
  const ws = workbook.addWorksheet('Notes and Disclosures');
  title(ws, company, period, reportRun, 'Notes, Accounting Policies and Disclosures');
  const metadata = reportMetadata(company, period, reportRun);
  ws.addRow([]);
  [
    ['1', 'The financial results have been prepared in accordance with Indian Accounting Standards applicable to Schedule III Division II presentation.'],
    ['2', 'The report has been generated from uploaded trial balance data and rule-based ledger mappings.'],
    ['3', `Audit status: ${metadata.auditStatus}.`],
    ['4', `Board meeting date: ${metadata.boardMeetingDate}.`],
    ['5', `Paid-up capital: ${metadata.paidUpCapital}; face value: ${metadata.faceValue}.`],
    ['6', `Director: ${metadata.directorName}; DIN: ${metadata.din}.`],
    ['7', 'CSR, crypto/virtual currency, and other statutory disclosures should be reviewed by the CA before external use.'],
    ['8', 'Previous period figures should be regrouped/rearranged wherever necessary.']
  ].forEach((row) => ws.addRow(row));
  formatSupportSheet(ws);
}

function addXbrlMapping(workbook, mapped) {
  const ws = workbook.addWorksheet('XBRL Mapping');
  ws.addRow(['Ledger', 'Schedule III Line', 'Statement', 'XBRL Element', 'Mapping Source']);
  mapped.forEach((item) => ws.addRow([item.rawName, item.scheduleLabel, item.statement, item.xbrlElement, item.mappingSource]));
  formatSupportSheet(ws);
}

function addUnmapped(workbook, unmapped) {
  const ws = workbook.addWorksheet('Unmapped Ledgers');
  ws.addRow(['Status', 'Ledger', 'Debit', 'Credit', 'Net Amount']);
  unmapped.forEach((item) => ws.addRow(['unmapped', item.rawName, item.debitAmount, item.creditAmount, item.netAmount]));
  formatSupportSheet(ws);
}

function addResultLine(ws, rowNumber, code, label, amount) {
  setFormulaAcross(ws, rowNumber, [code, label, amount]);
}

function addFormulaLine(ws, rowNumber, code, label, formula) {
  const row = ws.getRow(rowNumber);
  row.getCell(1).value = code;
  row.getCell(2).value = label;
  ['C', 'D', 'E', 'F', 'G', 'H'].forEach((col) => {
    row.getCell(col).value = { formula: formula.replaceAll('C', col) };
  });
}

function setFormulaAcross(ws, rowNumber, values) {
  const [code, label, amount] = values;
  const row = ws.getRow(rowNumber);
  row.getCell(1).value = code;
  row.getCell(2).value = label;
  ['C', 'D', 'E', 'F', 'G', 'H'].forEach((col, index) => {
    row.getCell(col).value = index === 0 ? amount : '';
  });
}

function addSlaLine(ws, rowNumber, code, label, amount) {
  const row = ws.getRow(rowNumber);
  row.getCell(1).value = code;
  row.getCell(2).value = label;
  row.getCell(3).value = amount;
}

function addSlaFormula(ws, rowNumber, code, label, formula) {
  const row = ws.getRow(rowNumber);
  row.getCell(1).value = code;
  row.getCell(2).value = label;
  ['C', 'D', 'E'].forEach((col) => {
    row.getCell(col).value = { formula: formula.replaceAll('C', col) };
  });
}

function addLine(ws, code, label, amount) {
  ws.addRow([code, label, amount === '' ? '' : round(amount)]);
}

function addNoteRows(ws, metadata, startRow) {
  const notes = [
    `The above results have been reviewed by the Audit Committee and have been approved by the Board of Directors of the Company at their meeting held on ${metadata.boardMeetingDate}.`,
    'The financial results have been prepared in accordance with Indian Accounting Standards prescribed under the Companies Act, 2013 and Schedule III Division II presentation requirements.',
    'The Company presents financial results based on uploaded trial balance data and rule-based ledger mappings.',
    'Earnings per share are calculated on paid-up equity share capital where available. Period EPS is not annualised.',
    'There are no investor complaints pending as on the reporting date, unless otherwise specified by management.',
    'Previous period figures have been regrouped/rearranged wherever necessary.',
    'Unmapped ledgers, if any, are listed below and must be reviewed before external use.'
  ];
  notes.forEach((note, index) => {
    ws.getRow(startRow + index).getCell(1).value = index + 1;
    ws.getRow(startRow + index).getCell(2).value = note;
    ws.mergeCells(startRow + index, 2, startRow + index, 8);
  });
}

function addUnmappedAtBottom(ws, unmapped, startRow, lastColumn) {
  const endColumn = lastColumn === 8 ? 'H' : 'E';
  ws.getRow(startRow).getCell(1).value = 'Unmapped Ledgers';
  ws.getRow(startRow).font = { bold: true };
  ws.getRow(startRow + 1).values = ['Status', 'Ledger', 'Debit', 'Credit', 'Net Amount'];
  unmapped.forEach((item, index) => {
    ws.getRow(startRow + 2 + index).values = ['unmapped', item.rawName, item.debitAmount, item.creditAmount, item.netAmount];
  });
  if (!unmapped.length) ws.getRow(startRow + 2).values = ['unmapped', 'None', '', '', ''];
  ws.getRow(startRow).eachCell((cell) => styleHeaderCell(cell));
  ws.getRow(startRow + 1).eachCell((cell) => styleHeaderCell(cell));
  ws.mergeCells(`A${startRow}:${endColumn}${startRow}`);
}

function setupResultColumns(ws) {
  ws.columns = [
    { key: 'code', width: 7 },
    { key: 'particulars', width: 58 },
    { key: 'current', width: 15 },
    { key: 'previous', width: 15 },
    { key: 'prior', width: 15 },
    { key: 'periodCurrent', width: 15 },
    { key: 'periodPrior', width: 15 },
    { key: 'yearEnded', width: 15 }
  ];
}

function setupSlaColumns(ws) {
  ws.columns = [
    { key: 'code', width: 7 },
    { key: 'particulars', width: 58 },
    { key: 'current', width: 18 },
    { key: 'previous', width: 18 },
    { key: 'opening', width: 18 }
  ];
}

function formatResultSheet(ws) {
  ws.views = [{ state: 'frozen', ySplit: 7 }];
  [7, 8, 9, 10, 11, 12].forEach((rowNumber) => {
    ws.getRow(rowNumber).eachCell((cell) => styleHeaderCell(cell));
  });
  formatCommon(ws);
  for (let row = 13; row <= 52; row += 1) {
    ws.getRow(row).getCell(2).alignment = { wrapText: true, vertical: 'middle' };
  }
}

function formatSlaSheet(ws) {
  ws.views = [{ state: 'frozen', ySplit: 8 }];
  [7, 8].forEach((rowNumber) => {
    ws.getRow(rowNumber).eachCell((cell) => styleHeaderCell(cell));
  });
  formatCommon(ws);
}

function formatSupportSheet(ws) {
  ws.columns.forEach((column) => {
    column.width = 26;
  });
  formatCommon(ws);
}

function formatCommon(ws) {
  ws.eachRow((row, rowNumber) => {
    row.height = rowNumber <= 6 ? 20 : undefined;
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      cell.alignment = { vertical: 'middle', wrapText: colNumber === 2 };
      if (typeof cell.value === 'number' || cell.value?.formula) {
        cell.numFmt = MONEY_FORMAT;
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
    });
  });
}

function styleHeaderCell(cell) {
  cell.font = { bold: true };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function mergeValue(ws, range, value, style) {
  ws.mergeCells(range);
  const cell = ws.getCell(range.split(':')[0]);
  cell.value = value;
  cell.font = { bold: true, size: style === 'title' ? 14 : 11 };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
}

function setRow(ws, rowNumber, values) {
  const row = ws.getRow(rowNumber);
  values.forEach((value, index) => {
    row.getCell(index + 1).value = value;
  });
}

function title(ws, company, period, reportRun, heading) {
  ws.addRow([company.name]);
  ws.addRow([`CIN: ${company.cin || 'Not specified'}`]);
  ws.addRow([`Registered Office: ${company.registeredOffice || 'Not specified'}`]);
  ws.addRow([`${heading} for ${period.label}`]);
  ws.addRow([`Report Type: ${reportRun.reportType || 'standalone'} | Framework: Schedule III Division II / Ind AS`]);
}

function reportMetadata(company, period, reportRun) {
  const metadata = { ...(company.metadata || {}), ...(reportRun.metadata || {}) };
  return {
    auditStatus: metadata.auditStatus || 'Unaudited',
    reportNature: titleCase(reportRun.reportType || metadata.reportType || 'standalone'),
    boardMeetingDate: metadata.boardMeetingDate || 'Not specified',
    paidUpCapital: metadata.paidUpCapital || '',
    faceValue: metadata.faceValue || 'Not specified',
    directorName: metadata.directorName || 'Not specified',
    din: metadata.din || 'Not specified',
    place: metadata.place || 'Not specified',
    periodType: period.periodType || 'period'
  };
}

function buildDisplayPeriods(period, comparativePeriods = []) {
  const fallback = { startDate: period.startDate, endDate: period.endDate };
  const sorted = [...comparativePeriods].sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  const previous = sorted[0] || fallback;
  const prior = sorted[1] || previous;
  const year = sorted.find((item) => item.periodType === 'annual') || sorted[2] || fallback;
  return [period, previous, prior, year].map((item) => ({
    start: displayDate(item.startDate),
    end: displayDate(item.endDate)
  }));
}

function periodGroupLabel(period) {
  const type = period.periodType || '';
  if (type === 'quarterly') return 'Quarter Ended';
  if (type === 'half_yearly') return 'Half Year / Period ended';
  if (type === 'annual') return 'Year Ended';
  if (type === 'monthly') return 'Month Ended';
  return 'Period ended';
}

function periodLabel(period) {
  const type = period.periodType || '';
  if (type === 'quarterly') return 'quarter';
  if (type === 'half_yearly') return 'half year';
  if (type === 'annual') return 'year';
  if (type === 'monthly') return 'month';
  return 'period';
}

function aggregate(mapped) {
  return mapped.reduce((acc, item) => {
    acc[item.scheduleLineId] = (acc[item.scheduleLineId] || 0) + item.netAmount;
    return acc;
  }, {});
}

function debit(value = 0) {
  return value > 0 ? value : 0;
}

function credit(value = 0) {
  return value < 0 ? Math.abs(value) : 0;
}

function expenseTotal(totals) {
  return ['materials_consumed', 'stock_trade_purchase', 'employee_benefits', 'finance_costs', 'depreciation', 'other_expenses']
    .reduce((sum, key) => sum + debit(totals[key]), 0);
}

function numberValue(value) {
  const parsed = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function displayDate(value) {
  if (!value) return 'Not specified';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB');
}

function titleCase(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function round(value) {
  return Math.round((value || 0) * 100) / 100;
}
