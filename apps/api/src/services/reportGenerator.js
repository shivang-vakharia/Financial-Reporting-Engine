import ExcelJS from 'exceljs';

export async function generateReportWorkbook({ company, period, reportRun, ledgers, mappings, outputPath, comparativePeriods }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Financial Reporting Engine';
  workbook.created = new Date();

  const mapped = mappings.filter((item) => item.status === 'mapped');
  const unmapped = mappings.filter((item) => item.status === 'unmapped');
  const totals = aggregate(mapped);

  addFinancialResults(workbook, company, period, reportRun, totals, unmapped);
  addAssetsLiabilities(workbook, company, period, totals, unmapped);
  addCashFlow(workbook, company, period, totals, comparativePeriods);
  addChangesInEquity(workbook, company, period, totals);
  addNotes(workbook, company, period, reportRun);
  addXbrlMapping(workbook, mapped);
  addUnmapped(workbook, unmapped, ledgers);

  workbook.worksheets.forEach(formatSheet);
  await workbook.xlsx.writeFile(outputPath);
}

function addFinancialResults(workbook, company, period, reportRun, totals, unmapped) {
  const ws = workbook.addWorksheet('Financial Results');
  title(ws, company, period, reportRun, 'Statement of Financial Results');
  ws.addRow([]);
  ws.addRow(['Particulars', 'Current Period', 'Comparative 1', 'Comparative 2', 'Year Ended']);
  addLine(ws, 'I', 'Revenue from Operations', credit(totals.revenue_operations));
  addLine(ws, 'II', 'Other Income', credit(totals.other_income));
  addLine(ws, 'III', 'Total Income (I + II)', credit(totals.revenue_operations) + credit(totals.other_income));
  addLine(ws, 'IV(a)', 'Cost of Materials Consumed', debit(totals.materials_consumed));
  addLine(ws, 'IV(b)', 'Purchases of Stock-in-trade', debit(totals.stock_trade_purchase));
  addLine(ws, 'IV(c)', 'Employee Benefits Expense', debit(totals.employee_benefits));
  addLine(ws, 'IV(d)', 'Finance Costs', debit(totals.finance_costs));
  addLine(ws, 'IV(e)', 'Depreciation and Amortisation Expense', debit(totals.depreciation));
  addLine(ws, 'IV(f)', 'Other Expenses', debit(totals.other_expenses));
  addLine(ws, 'V', 'Total Expenses', expenseTotal(totals));
  addLine(ws, 'VI', 'Profit/(Loss) Before Tax', credit(totals.revenue_operations) + credit(totals.other_income) - expenseTotal(totals));
  addLine(ws, 'VII', 'Tax Expense', debit(totals.tax_expense));
  addLine(ws, 'VIII', 'Profit/(Loss) for the Period', credit(totals.revenue_operations) + credit(totals.other_income) - expenseTotal(totals) - debit(totals.tax_expense));
  ws.addRow([]);
  ws.addRow(['Unmapped ledgers', unmapped.length ? `${unmapped.length} ledgers flagged as unmapped` : 'None']);
  unmapped.forEach((item) => ws.addRow(['unmapped', item.rawName, item.netAmount]));
}

function addAssetsLiabilities(workbook, company, period, totals, unmapped) {
  const ws = workbook.addWorksheet('Assets and Liabilities');
  title(ws, company, period, {}, 'Standalone / Consolidated Statement of Assets and Liabilities');
  ws.addRow([]);
  ws.addRow(['Particulars', `As at ${period.endDate}`]);
  addLine(ws, 'A', 'ASSETS', '');
  addLine(ws, '1(a)', 'Property, Plant and Equipment', debit(totals.ppe));
  addLine(ws, '1(b)', 'Investments', debit(totals.investments));
  addLine(ws, '2(a)', 'Inventories', debit(totals.inventories));
  addLine(ws, '2(b)', 'Trade Receivables', debit(totals.trade_receivables));
  addLine(ws, '2(c)', 'Cash and Cash Equivalents', debit(totals.cash_equivalents));
  addLine(ws, '2(d)', 'Bank Balances', debit(totals.bank_balances));
  addLine(ws, '2(e)', 'Loans', debit(totals.loans_assets));
  addLine(ws, '2(f)', 'Other Current Assets', debit(totals.other_current_assets));
  addLine(ws, '', 'Total Assets', assetTotal(totals));
  ws.addRow([]);
  addLine(ws, 'B', 'EQUITY AND LIABILITIES', '');
  addLine(ws, '1(a)', 'Equity Share Capital', credit(totals.equity_share_capital));
  addLine(ws, '1(b)', 'Other Equity', credit(totals.other_equity));
  addLine(ws, '2(a)', 'Borrowings', credit(totals.borrowings_current) + credit(totals.borrowings_non_current));
  addLine(ws, '2(b)', 'Trade Payables', credit(totals.trade_payables));
  addLine(ws, '2(c)', 'Other Current Liabilities', credit(totals.other_current_liabilities));
  addLine(ws, '', 'Total Equity and Liabilities', equityLiabilityTotal(totals));
  ws.addRow([]);
  ws.addRow(['Unmapped ledgers', unmapped.length ? `${unmapped.length} ledgers flagged as unmapped` : 'None']);
}

function addCashFlow(workbook, company, period, totals) {
  const ws = workbook.addWorksheet('Cash Flow');
  title(ws, company, period, {}, 'Statement of Cash Flows');
  ws.addRow([]);
  ws.addRow(['Particulars', 'Current Period']);
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
}

function addChangesInEquity(workbook, company, period, totals) {
  const ws = workbook.addWorksheet('Changes in Equity');
  title(ws, company, period, {}, 'Statement of Changes in Equity');
  ws.addRow([]);
  ws.addRow(['Particulars', 'Equity Share Capital', 'Other Equity', 'Total']);
  const capital = credit(totals.equity_share_capital);
  const other = credit(totals.other_equity);
  ws.addRow(['Balance at beginning of reporting period', '', '', '']);
  ws.addRow(['Changes during the period', capital, other, capital + other]);
  ws.addRow(['Balance at end of reporting period', capital, other, capital + other]);
}

function addNotes(workbook, company, period, reportRun) {
  const ws = workbook.addWorksheet('Notes and Disclosures');
  title(ws, company, period, reportRun, 'Notes, Accounting Policies and Disclosures');
  const metadata = { ...company.metadata, ...reportRun.metadata };
  ws.addRow([]);
  [
    ['1', 'The financial results have been prepared in accordance with Indian Accounting Standards applicable to Schedule III Division II presentation.'],
    ['2', 'The report has been generated from uploaded trial balance data and rule-based ledger mappings.'],
    ['3', `Audit status: ${metadata.auditStatus || 'Not specified'}.`],
    ['4', `Board meeting date: ${metadata.boardMeetingDate || 'Not specified'}.`],
    ['5', `Paid-up capital: ${metadata.paidUpCapital || 'Not specified'}; face value: ${metadata.faceValue || 'Not specified'}.`],
    ['6', `Director: ${metadata.directorName || 'Not specified'}; DIN: ${metadata.din || 'Not specified'}.`],
    ['7', 'CSR, crypto/virtual currency, and other statutory disclosures should be reviewed by the CA before external use.'],
    ['8', 'Previous period figures should be regrouped or rearranged wherever necessary.']
  ].forEach((row) => ws.addRow(row));
}

function addXbrlMapping(workbook, mapped) {
  const ws = workbook.addWorksheet('XBRL Mapping');
  ws.addRow(['Ledger', 'Schedule III Line', 'Statement', 'XBRL Element', 'Mapping Source']);
  mapped.forEach((item) => ws.addRow([item.rawName, item.scheduleLabel, item.statement, item.xbrlElement, item.mappingSource]));
}

function addUnmapped(workbook, unmapped) {
  const ws = workbook.addWorksheet('Unmapped Ledgers');
  ws.addRow(['Status', 'Ledger', 'Debit', 'Credit', 'Net Amount']);
  unmapped.forEach((item) => ws.addRow(['unmapped', item.rawName, item.debitAmount, item.creditAmount, item.netAmount]));
}

function title(ws, company, period, reportRun, heading) {
  ws.addRow([company.name]);
  ws.addRow([`CIN: ${company.cin || 'Not specified'}`]);
  ws.addRow([`Registered Office: ${company.registeredOffice || 'Not specified'}`]);
  ws.addRow([`${heading} for ${period.label}`]);
  ws.addRow([`Report Type: ${reportRun.reportType || 'standalone'} | Framework: Schedule III Division II / Ind AS`]);
}

function addLine(ws, code, label, amount) {
  ws.addRow([code, label, amount === '' ? '' : round(amount)]);
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

function assetTotal(totals) {
  return ['ppe', 'investments', 'inventories', 'trade_receivables', 'cash_equivalents', 'bank_balances', 'loans_assets', 'other_current_assets']
    .reduce((sum, key) => sum + debit(totals[key]), 0);
}

function equityLiabilityTotal(totals) {
  return ['equity_share_capital', 'other_equity', 'borrowings_current', 'borrowings_non_current', 'trade_payables', 'other_current_liabilities']
    .reduce((sum, key) => sum + credit(totals[key]), 0);
}

function formatSheet(ws) {
  ws.columns.forEach((column) => {
    column.width = 26;
    column.alignment = { vertical: 'middle' };
  });
  ws.getRow(1).font = { bold: true, size: 14 };
  ws.eachRow((row, rowNumber) => {
    if (rowNumber <= 5 || rowNumber === 7) row.font = { bold: true };
    row.eachCell((cell) => {
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
    });
  });
}

function round(value) {
  return Math.round((value || 0) * 100) / 100;
}

