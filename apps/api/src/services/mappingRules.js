export const scheduleLines = [
  { id: 'equity_share_capital', statement: 'balance_sheet', section: 'Equity', label: 'Equity Share Capital', xbrl: 'in-gaap:EquityShareCapital' },
  { id: 'other_equity', statement: 'balance_sheet', section: 'Equity', label: 'Other Equity', xbrl: 'in-gaap:OtherEquity' },
  { id: 'borrowings_non_current', statement: 'balance_sheet', section: 'Non-current Liabilities', label: 'Borrowings', xbrl: 'in-gaap:NonCurrentBorrowings' },
  { id: 'borrowings_current', statement: 'balance_sheet', section: 'Current Liabilities', label: 'Borrowings', xbrl: 'in-gaap:CurrentBorrowings' },
  { id: 'trade_payables', statement: 'balance_sheet', section: 'Current Liabilities', label: 'Trade Payables', xbrl: 'in-gaap:TradePayablesCurrent' },
  { id: 'other_current_liabilities', statement: 'balance_sheet', section: 'Current Liabilities', label: 'Other Current Liabilities', xbrl: 'in-gaap:OtherCurrentLiabilities' },
  { id: 'ppe', statement: 'balance_sheet', section: 'Non-current Assets', label: 'Property, Plant and Equipment', xbrl: 'in-gaap:PropertyPlantAndEquipment' },
  { id: 'investments', statement: 'balance_sheet', section: 'Financial Assets', label: 'Investments', xbrl: 'in-gaap:Investments' },
  { id: 'inventories', statement: 'balance_sheet', section: 'Current Assets', label: 'Inventories', xbrl: 'in-gaap:Inventories' },
  { id: 'trade_receivables', statement: 'balance_sheet', section: 'Current Assets', label: 'Trade Receivables', xbrl: 'in-gaap:TradeReceivablesCurrent' },
  { id: 'cash_equivalents', statement: 'balance_sheet', section: 'Current Assets', label: 'Cash and Cash Equivalents', xbrl: 'in-gaap:CashAndCashEquivalents' },
  { id: 'bank_balances', statement: 'balance_sheet', section: 'Current Assets', label: 'Bank Balances Other Than Cash and Cash Equivalents', xbrl: 'in-gaap:BankBalancesOtherThanCashAndCashEquivalents' },
  { id: 'loans_assets', statement: 'balance_sheet', section: 'Financial Assets', label: 'Loans', xbrl: 'in-gaap:LoansCurrent' },
  { id: 'other_current_assets', statement: 'balance_sheet', section: 'Current Assets', label: 'Other Current Assets', xbrl: 'in-gaap:OtherCurrentAssets' },
  { id: 'revenue_operations', statement: 'profit_loss', section: 'Income', label: 'Revenue from Operations', xbrl: 'in-gaap:RevenueFromOperations' },
  { id: 'other_income', statement: 'profit_loss', section: 'Income', label: 'Other Income', xbrl: 'in-gaap:OtherIncome' },
  { id: 'materials_consumed', statement: 'profit_loss', section: 'Expenses', label: 'Cost of Materials Consumed', xbrl: 'in-gaap:CostOfMaterialsConsumed' },
  { id: 'stock_trade_purchase', statement: 'profit_loss', section: 'Expenses', label: 'Purchases of Stock-in-trade', xbrl: 'in-gaap:PurchasesOfStockInTrade' },
  { id: 'employee_benefits', statement: 'profit_loss', section: 'Expenses', label: 'Employee Benefits Expense', xbrl: 'in-gaap:EmployeeBenefitsExpense' },
  { id: 'finance_costs', statement: 'profit_loss', section: 'Expenses', label: 'Finance Costs', xbrl: 'in-gaap:FinanceCosts' },
  { id: 'depreciation', statement: 'profit_loss', section: 'Expenses', label: 'Depreciation and Amortisation Expense', xbrl: 'in-gaap:DepreciationDepletionAndAmortisationExpense' },
  { id: 'other_expenses', statement: 'profit_loss', section: 'Expenses', label: 'Other Expenses', xbrl: 'in-gaap:OtherExpenses' },
  { id: 'tax_expense', statement: 'profit_loss', section: 'Tax', label: 'Tax Expense', xbrl: 'in-gaap:TaxExpense' }
];

export const mappingRules = [
  rule('capital|share capital|equity share', 'equity_share_capital'),
  rule('reserve|surplus|retained earnings|other equity', 'other_equity'),
  rule('secured loan|unsecured loan|borrowings|loan liability|bank od|cash credit', 'borrowings_current'),
  rule('creditor|trade payable|sundry creditor|payable', 'trade_payables'),
  rule('duties|tax payable|gst payable|tds payable|current liabilities|booking|advance from customer', 'other_current_liabilities'),
  rule('fixed asset|plant|machinery|equipment|vehicle|furniture|computer|printer|mobile|air conditioner', 'ppe'),
  rule('investment|fd|deposit', 'investments'),
  rule('stock|inventory|work in progress|wip|opening stock|closing stock', 'inventories'),
  rule('debtor|receivable|sundry debtor', 'trade_receivables'),
  rule('cash in hand|cash-in-hand', 'cash_equivalents'),
  rule('bank account|bank balance|current account|savings account', 'bank_balances'),
  rule('loan and advance|loans advances|advance asset', 'loans_assets'),
  rule('deposit asset|current asset|prepaid|other asset', 'other_current_assets'),
  rule('sales|revenue|turnover|flat sales|shop sales', 'revenue_operations'),
  rule('interest income|indirect income|other income|discount received', 'other_income'),
  rule('material consumed|raw material|cement purchase|sand purchase|brick purchase|hardware purchase', 'materials_consumed'),
  rule('purchase account|stock in trade|purchase @|purchases', 'stock_trade_purchase'),
  rule('salary|wages|employee|bonus|gratuity|pf|esi', 'employee_benefits'),
  rule('interest on|bank charges|finance cost|commission', 'finance_costs'),
  rule('depreciation|amortisation|amortization', 'depreciation'),
  rule('tax expense|current tax|deferred tax|income tax', 'tax_expense'),
  rule('expense|fees|electricity|freight|miscellaneous|rera|software|stationery|construction|labour|gst expense|smc', 'other_expenses')
];

function rule(pattern, lineId) {
  const line = scheduleLines.find((item) => item.id === lineId);
  return {
    id: `${lineId}_${pattern.split('|')[0].replace(/\s+/g, '_')}`,
    pattern: new RegExp(`\\b(${pattern})\\b`, 'i'),
    line
  };
}

