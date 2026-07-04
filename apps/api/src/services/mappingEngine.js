import { mappingRules } from './mappingRules.js';

export function mapLedgers(ledgers) {
  return ledgers.map((ledger) => {
    const ledgerName = ledger.normalizedName || normalizeName(ledger.rawName);
    const parentGroup = normalizeName(ledger.parentGroup || '');
    const matched = mappingRules.find((rule) => rule.pattern.test(ledgerName)) ||
      mappingRules.find((rule) => rule.pattern.test(parentGroup));
    if (!matched) {
      return {
        id: `${ledger.id}:unmapped`,
        uploadId: ledger.uploadId,
        periodId: ledger.periodId,
        ledgerEntryId: ledger.id,
        rawName: ledger.rawName,
        netAmount: ledger.netAmount,
        debitAmount: ledger.debitAmount,
        creditAmount: ledger.creditAmount,
        status: 'unmapped',
        scheduleLineId: null,
        scheduleLabel: 'unmapped',
        statement: 'unmapped',
        xbrlElement: null,
        mappingSource: 'unmapped',
        confidenceLabel: 'unmapped'
      };
    }
    return {
      id: `${ledger.id}:${matched.line.id}`,
      uploadId: ledger.uploadId,
      periodId: ledger.periodId,
      ledgerEntryId: ledger.id,
      rawName: ledger.rawName,
      netAmount: ledger.netAmount,
      debitAmount: ledger.debitAmount,
      creditAmount: ledger.creditAmount,
      status: 'mapped',
      scheduleLineId: matched.line.id,
      scheduleLabel: matched.line.label,
      statement: matched.line.statement,
      section: matched.line.section,
      xbrlElement: matched.line.xbrl,
      mappingSource: 'keyword_rule',
      confidenceLabel: 'rule'
    };
  });
}

function normalizeName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
