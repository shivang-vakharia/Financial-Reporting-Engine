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
  rule('equity share capital|share capital|share capital account|equity share', 'equity_share_capital'),
  rule('reserve|surplus|retained earnings|profit and loss|p\u0026l|other equity|general reserve|capital reserve', 'other_equity'),
  rule('long term borrowings|term loan|non[- ]current borrowings|deferred payment liabilities', 'borrowings_non_current'),
  rule('secured loan|unsecured loan|borrowings|loan liability|bank od|cash credit|short term loan|working capital finance', 'borrowings_current'),
  rule('creditor|creditors|trade payable|trade payables|sundry creditor|sundry creditors|payable|payables|accounts payable|a\/p|supplier', 'trade_payables'),
  rule('duties|tax payable|gst payable|tds payable|current liabilities|statutory liabilities|provision|advance from customer|liability', 'other_current_liabilities'),
  rule('fixed asset|fixed assets|plant|machinery|equipment|vehicle|furniture|computer|printer|mobile|air conditioner|building|land', 'ppe'),
  rule('investment|investments|fd|fixed deposit|mutual fund|shares|securities|long term investment', 'investments'),
  rule('material consumed|raw material purchase|raw material|cement purchase|sand purchase|brick purchase|hardware purchase|stores consumed|direct materials|raw materials consumed', 'materials_consumed'),
  rule('stock|inventory|work in progress|wip|opening stock|closing stock|finished goods|trading goods', 'inventories'),
  rule('debtor|debtors|receivable|receivables|sundry debtor|sundry debtors|accounts receivable|a\/r|customer|trade receivable', 'trade_receivables'),
  rule('cash in hand|cash-in-hand|cash balance|cash at bank|cash with bank|cash and cash equivalents', 'cash_equivalents'),
  rule('bank account|bank accounts|bank balance|bank balances|current account|savings account|bank deposits', 'bank_balances'),
  rule('loan and advance|loans advances|advance asset|advance recoverable|prepaid expense|advance to', 'loans_assets'),
  rule('deposit asset|deposits asset|deposits|current asset|current assets|prepaid|other asset|other current asset|security deposit|rent deposit|input gst|tds receivable', 'other_current_assets'),
  rule('sales|revenue|turnover|flat sales|shop sales|income from operations|net sales|gross sales', 'revenue_operations'),
  rule('interest income|indirect income|other income|discount received|rental income|dividend income|commission received', 'other_income'),
  rule('material consumed|raw material|cement purchase|sand purchase|brick purchase|hardware purchase|stores consumed|direct materials|raw materials consumed', 'materials_consumed'),
  rule('purchase account|stock in trade|purchase @|purchases|purchase of goods|goods purchased|trading purchase', 'stock_trade_purchase'),
  rule('salary|wages|employee|bonus|gratuity|pf|esi|provident fund|payroll|staff welfare|employee benefits', 'employee_benefits'),
  rule('interest on|bank charges|finance cost|finance costs|finance charge|finance charges|commission|loan interest|interest expense|bank charges expense', 'finance_costs'),
  rule('depreciation|amortisation|amortization|depletion', 'depreciation'),
  rule('tax expense|current tax|deferred tax|income tax|tax liability|tax provision|tds|gst tax|tax expense', 'tax_expense'),
  rule('expense|fees|electricity|freight|miscellaneous|rera|software|stationery|construction|labour|gst expense|smc|legal expense|rent expense|printing|advertisement|repair|maintenance', 'other_expenses')
];

function rule(pattern, lineId) {
  const line = scheduleLines.find((item) => item.id === lineId);
  return {
    id: `${lineId}_${pattern.split('|')[0].replace(/\s+/g, '_')}`,
    pattern: new RegExp(`\\b(${pattern})\\b`, 'i'),
    line
  };
}
