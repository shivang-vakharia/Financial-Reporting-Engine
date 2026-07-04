import ExcelJS from 'exceljs';

export async function parseTrialBalance(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('The workbook does not contain any sheets.');

  const header = detectHeader(sheet);
  const ledgers = [];
  let debitTotal = 0;
  let creditTotal = 0;
  let parentGroup = '';

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber <= header.rowNumber) return;
    const name = text(row.getCell(header.nameCol).value);
    if (!name || /^grand total$/i.test(name)) return;
    const debit = money(row.getCell(header.debitCol).value);
    const credit = money(row.getCell(header.creditCol).value);
    if (debit === 0 && credit === 0) {
      parentGroup = name;
      return;
    }

    debitTotal += debit;
    creditTotal += credit;
    ledgers.push({
      rawName: name,
      normalizedName: normalizeName(name),
      parentGroup,
      debitAmount: debit,
      creditAmount: credit,
      netAmount: debit - credit,
      sourceRowNumber: rowNumber
    });
  });

  if (!ledgers.length) {
    throw new Error('No ledger rows were detected. Expected columns for Particulars, Debit, and Credit.');
  }

  return {
    ledgers,
    debitTotal,
    creditTotal,
    variance: round(debitTotal - creditTotal)
  };
}

function detectHeader(sheet) {
  let nameCol = 1;
  let debitCol = 2;
  let creditCol = 3;
  let rowNumber = 1;

  sheet.eachRow((row, currentRow) => {
    const values = Array.from(row.values).map((value) => text(value).toLowerCase());
    const nameIndex = values.findIndex((value) => ['particulars', 'ledger', 'ledger name', 'account name'].includes(value));
    const debitIndex = values.findIndex((value) => value === 'debit' || value.includes(' debit'));
    const creditIndex = values.findIndex((value) => value === 'credit' || value.includes(' credit'));
    if (nameIndex > -1) {
      nameCol = nameIndex;
      rowNumber = currentRow;
    }
    if (debitIndex > -1) debitCol = debitIndex;
    if (creditIndex > -1) creditCol = creditIndex;
  });

  return { rowNumber, nameCol, debitCol, creditCol };
}

function text(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && value.richText) return value.richText.map((item) => item.text).join('');
  if (typeof value === 'object' && value.text) return value.text;
  return String(value).trim();
}

function money(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const parsed = Number(String(value).replace(/[(),]/g, '').replace(/\s/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function round(value) {
  return Math.round(value * 100) / 100;
}
