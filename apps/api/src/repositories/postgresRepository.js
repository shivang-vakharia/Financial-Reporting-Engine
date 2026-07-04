export function createPostgresRepository(pool) {
  return {
    async findUserByEmail(email) {
      const result = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email || '']);
      return result.rows[0] ? userFromRow(result.rows[0]) : null;
    },
    async createUser(user) {
      const result = await pool.query(
        `INSERT INTO users (id, name, email, password_hash, created_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user.id, user.name, user.email, user.passwordHash, user.createdAt]
      );
      return userFromRow(result.rows[0]);
    },
    async listCompanies(ownerId) {
      const result = await pool.query('SELECT * FROM companies WHERE owner_id = $1 ORDER BY created_at DESC', [ownerId]);
      return result.rows.map(companyFromRow);
    },
    async createCompany(company) {
      const result = await pool.query(
        `INSERT INTO companies (id, owner_id, name, cin, registered_office, reporting_framework, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [company.id, company.ownerId, company.name, company.cin, company.registeredOffice, company.reportingFramework, company.metadata, company.createdAt]
      );
      return companyFromRow(result.rows[0]);
    },
    async getCompanyForOwner(companyId, ownerId) {
      const result = await pool.query('SELECT * FROM companies WHERE id = $1 AND owner_id = $2', [companyId, ownerId]);
      return result.rows[0] ? companyFromRow(result.rows[0]) : null;
    },
    async updateCompany(companyId, ownerId, patch) {
      const current = await this.getCompanyForOwner(companyId, ownerId);
      if (!current) return null;
      const metadata = { ...(current.metadata || {}), ...(patch.metadata || {}) };
      const result = await pool.query(
        `UPDATE companies
         SET name = $1, cin = $2, registered_office = $3, metadata = $4
         WHERE id = $5 AND owner_id = $6 RETURNING *`,
        [
          patch.name ?? current.name,
          patch.cin ?? current.cin,
          patch.registeredOffice ?? current.registeredOffice,
          metadata,
          companyId,
          ownerId
        ]
      );
      return companyFromRow(result.rows[0]);
    },
    async listPeriods(companyId) {
      const result = await pool.query('SELECT * FROM reporting_periods WHERE company_id = $1 ORDER BY end_date DESC', [companyId]);
      return result.rows.map(periodFromRow);
    },
    async createPeriod(period) {
      const result = await pool.query(
        `INSERT INTO reporting_periods (id, company_id, label, period_type, start_date, end_date, financial_year, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [period.id, period.companyId, period.label, period.periodType, period.startDate, period.endDate, period.financialYear, period.createdAt]
      );
      return periodFromRow(result.rows[0]);
    },
    async getPeriodForOwner(periodId, ownerId) {
      const result = await pool.query(
        `SELECT p.*, c.id AS c_id, c.owner_id, c.name, c.cin, c.registered_office, c.reporting_framework, c.metadata, c.created_at AS c_created_at
         FROM reporting_periods p
         JOIN companies c ON c.id = p.company_id
         WHERE p.id = $1 AND c.owner_id = $2`,
        [periodId, ownerId]
      );
      if (!result.rows[0]) return null;
      return { period: periodFromRow(result.rows[0]), company: companyFromJoinedRow(result.rows[0]) };
    },
    async createUpload(upload) {
      const result = await pool.query(
        `INSERT INTO trial_balance_uploads (id, period_id, original_name, stored_path, row_count, debit_total, credit_total, variance, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [upload.id, upload.periodId, upload.originalName, upload.storedPath, upload.rowCount, upload.debitTotal, upload.creditTotal, upload.variance, upload.createdAt]
      );
      return uploadFromRow(result.rows[0]);
    },
    async createLedgers(ledgers) {
      if (!ledgers.length) return [];
      const values = [];
      const params = [];
      ledgers.forEach((ledger, index) => {
        const offset = index * 10;
        values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`);
        params.push(ledger.id, ledger.uploadId, ledger.periodId, ledger.rawName, ledger.normalizedName, ledger.parentGroup, ledger.debitAmount, ledger.creditAmount, ledger.netAmount, ledger.sourceRowNumber);
      });
      const result = await pool.query(
        `INSERT INTO ledger_entries (id, upload_id, period_id, raw_name, normalized_name, parent_group, debit_amount, credit_amount, net_amount, source_row_number)
         VALUES ${values.join(', ')} RETURNING *`,
        params
      );
      return result.rows.map(ledgerFromRow);
    },
    async listUploads(periodId) {
      const result = await pool.query('SELECT * FROM trial_balance_uploads WHERE period_id = $1 ORDER BY created_at DESC', [periodId]);
      return result.rows.map(uploadFromRow);
    },
    async listLedgersByUpload(uploadId) {
      const result = await pool.query('SELECT * FROM ledger_entries WHERE upload_id = $1 ORDER BY source_row_number', [uploadId]);
      return result.rows.map(ledgerFromRow);
    },
    async listLedgersByPeriod(periodId) {
      const result = await pool.query('SELECT * FROM ledger_entries WHERE period_id = $1 ORDER BY source_row_number', [periodId]);
      return result.rows.map(ledgerFromRow);
    },
    async replaceMappingsForUpload(uploadId, mappings) {
      await pool.query('DELETE FROM ledger_mapping_results WHERE upload_id = $1', [uploadId]);
      return insertMappings(pool, mappings);
    },
    async replaceMappingsForPeriod(periodId, mappings) {
      await pool.query('DELETE FROM ledger_mapping_results WHERE period_id = $1', [periodId]);
      return insertMappings(pool, mappings);
    },
    async listMappingsByPeriod(periodId) {
      const result = await pool.query('SELECT * FROM ledger_mapping_results WHERE period_id = $1 ORDER BY created_at', [periodId]);
      return result.rows.map(mappingFromRow);
    },
    async getMappingById(mappingId) {
      const result = await pool.query('SELECT * FROM ledger_mapping_results WHERE id = $1', [mappingId]);
      return result.rows[0] ? mappingFromRow(result.rows[0]) : null;
    },
    async updateMapping(mappingId, patch) {
      const current = await this.getMappingById(mappingId);
      if (!current) return null;
      const result = await pool.query(
        `UPDATE ledger_mapping_results
         SET status = $1,
             schedule_line_id = $2,
             schedule_label = $3,
             statement = $4,
             section = $5,
             xbrl_element = $6,
             mapping_source = $7,
             confidence_label = $8
         WHERE id = $9
         RETURNING *`,
        [
          patch.status ?? current.status,
          patch.scheduleLineId ?? current.scheduleLineId,
          patch.scheduleLabel ?? current.scheduleLabel,
          patch.statement ?? current.statement,
          patch.section ?? current.section,
          patch.xbrlElement ?? current.xbrlElement,
          patch.mappingSource ?? current.mappingSource,
          patch.confidenceLabel ?? current.confidenceLabel,
          mappingId
        ]
      );
      return result.rows[0] ? mappingFromRow(result.rows[0]) : null;
    },
    async listMappingsByPeriodIds(periodIds) {
      if (!periodIds || !periodIds.length) return [];
      const result = await pool.query('SELECT * FROM ledger_mapping_results WHERE period_id = ANY($1) ORDER BY created_at', [periodIds]);
      return result.rows.map(mappingFromRow);
    },
    async listReportRunsForCompany(companyId) {
      const result = await pool.query('SELECT * FROM report_runs WHERE company_id = $1 ORDER BY created_at DESC', [companyId]);
      return result.rows.map(reportRunFromRow);
    },
    async deleteCompany(companyId, ownerId) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const companyResult = await client.query('SELECT * FROM companies WHERE id = $1 AND owner_id = $2', [companyId, ownerId]);
        if (!companyResult.rows[0]) {
          await client.query('ROLLBACK');
          return null;
        }
        const company = companyFromRow(companyResult.rows[0]);
        const periodIdsResult = await client.query('SELECT id FROM reporting_periods WHERE company_id = $1', [companyId]);
        const periodIds = periodIdsResult.rows.map((row) => row.id);
        if (periodIds.length) {
          await client.query('DELETE FROM ledger_mapping_results WHERE period_id = ANY($1)', [periodIds]);
          await client.query('DELETE FROM ledger_entries WHERE period_id = ANY($1)', [periodIds]);
          await client.query('DELETE FROM trial_balance_uploads WHERE period_id = ANY($1)', [periodIds]);
          await client.query('DELETE FROM reporting_periods WHERE id = ANY($1)', [periodIds]);
        }
        await client.query('DELETE FROM report_runs WHERE company_id = $1', [companyId]);
        await client.query('DELETE FROM companies WHERE id = $1 AND owner_id = $2', [companyId, ownerId]);
        await client.query('COMMIT');
        return company;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async listPeriodsByIds(companyId, periodIds) {
      if (!periodIds || !periodIds.length) return [];
      const result = await pool.query(
        `SELECT * FROM reporting_periods WHERE company_id = $1 AND id = ANY($2)`,
        [companyId, periodIds]
      );
      return result.rows.map(periodFromRow);
    },
    async createReportRun(reportRun) {
      const result = await pool.query(
        `INSERT INTO report_runs (id, company_id, period_id, report_type, metadata, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [reportRun.id, reportRun.companyId, reportRun.periodId, reportRun.reportType, reportRun.metadata, reportRun.status, reportRun.createdAt]
      );
      return reportRunFromRow(result.rows[0]);
    },
    async completeReportRun(reportRunId, patch) {
      const result = await pool.query(
        `UPDATE report_runs
         SET status = $1, file_name = $2, output_path = $3, completed_at = $4
         WHERE id = $5 RETURNING *`,
        [patch.status, patch.fileName, patch.outputPath, patch.completedAt, reportRunId]
      );
      return result.rows[0] ? reportRunFromRow(result.rows[0]) : null;
    },
    async listReportRunsForOwner(ownerId) {
      const result = await pool.query(
        `SELECT r.* FROM report_runs r
         JOIN companies c ON c.id = r.company_id
         WHERE c.owner_id = $1
         ORDER BY r.created_at DESC`,
        [ownerId]
      );
      return result.rows.map(reportRunFromRow);
    },
    async getReportRunForOwner(reportRunId, ownerId) {
      const result = await pool.query(
        `SELECT r.* FROM report_runs r
         JOIN companies c ON c.id = r.company_id
         WHERE r.id = $1 AND c.owner_id = $2`,
        [reportRunId, ownerId]
      );
      return result.rows[0] ? reportRunFromRow(result.rows[0]) : null;
    },
    async listComparativePeriods(companyId, currentPeriodId) {
      const result = await pool.query(
        `SELECT * FROM reporting_periods
         WHERE company_id = $1 AND id <> $2
         ORDER BY end_date DESC
         LIMIT 3`,
        [companyId, currentPeriodId]
      );
      return result.rows.map(periodFromRow);
    }
  };
}

async function insertMappings(pool, mappings) {
  if (!mappings.length) return [];
  const values = [];
  const params = [];
  mappings.forEach((mapping, index) => {
    const offset = index * 14;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14})`);
    params.push(mapping.id, mapping.uploadId, mapping.periodId, mapping.ledgerEntryId, mapping.status, mapping.scheduleLineId, mapping.scheduleLabel, mapping.statement, mapping.section, mapping.xbrlElement, mapping.mappingSource, mapping.confidenceLabel, mapping.rawName, mapping.netAmount);
  });
  const result = await pool.query(
    `INSERT INTO ledger_mapping_results
     (id, upload_id, period_id, ledger_entry_id, status, schedule_line_id, schedule_label, statement, section, xbrl_element, mapping_source, confidence_label, raw_name, net_amount)
     VALUES ${values.join(', ')} RETURNING *`,
    params
  );
  return result.rows.map(mappingFromRow);
}

function userFromRow(row) {
  return { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash, createdAt: row.created_at?.toISOString?.() || row.created_at };
}

function companyFromRow(row) {
  return { id: row.id, ownerId: row.owner_id, name: row.name, cin: row.cin || '', registeredOffice: row.registered_office || '', reportingFramework: row.reporting_framework, metadata: row.metadata || {}, createdAt: row.created_at?.toISOString?.() || row.created_at };
}

function companyFromJoinedRow(row) {
  return { id: row.c_id, ownerId: row.owner_id, name: row.name, cin: row.cin || '', registeredOffice: row.registered_office || '', reportingFramework: row.reporting_framework, metadata: row.metadata || {}, createdAt: row.c_created_at?.toISOString?.() || row.c_created_at };
}

function periodFromRow(row) {
  return { id: row.id, companyId: row.company_id, label: row.label, periodType: row.period_type, startDate: date(row.start_date), endDate: date(row.end_date), financialYear: row.financial_year, createdAt: row.created_at?.toISOString?.() || row.created_at };
}

function uploadFromRow(row) {
  return { id: row.id, periodId: row.period_id, originalName: row.original_name, storedPath: row.stored_path, rowCount: Number(row.row_count), debitTotal: Number(row.debit_total), creditTotal: Number(row.credit_total), variance: Number(row.variance), createdAt: row.created_at?.toISOString?.() || row.created_at };
}

function ledgerFromRow(row) {
  return { id: row.id, uploadId: row.upload_id, periodId: row.period_id, rawName: row.raw_name, normalizedName: row.normalized_name, parentGroup: row.parent_group || '', debitAmount: Number(row.debit_amount), creditAmount: Number(row.credit_amount), netAmount: Number(row.net_amount), sourceRowNumber: row.source_row_number };
}

function mappingFromRow(row) {
  return { id: row.id, uploadId: row.upload_id, periodId: row.period_id, ledgerEntryId: row.ledger_entry_id, rawName: row.raw_name, netAmount: Number(row.net_amount || 0), status: row.status, scheduleLineId: row.schedule_line_id, scheduleLabel: row.schedule_label, statement: row.statement, section: row.section, xbrlElement: row.xbrl_element, mappingSource: row.mapping_source, confidenceLabel: row.confidence_label };
}

function reportRunFromRow(row) {
  return { id: row.id, companyId: row.company_id, periodId: row.period_id, reportType: row.report_type, metadata: row.metadata || {}, status: row.status, fileName: row.file_name, outputPath: row.output_path, createdAt: row.created_at?.toISOString?.() || row.created_at, completedAt: row.completed_at?.toISOString?.() || row.completed_at };
}

function date(value) {
  if (!value) return value;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

