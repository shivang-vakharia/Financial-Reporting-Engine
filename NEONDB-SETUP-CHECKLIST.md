# NeonDB Setup Checklist

Quick step-by-step for database provisioning.

## Account & Project Setup

- [ ] Create NeonDB account at https://neon.tech
- [ ] Create new project named "financial-reporting-engine"
- [ ] Choose PostgreSQL 16 and closest region to your users
- [ ] Project successfully created (status: "Running")

## Database Configuration

- [ ] Database name: `financial_reporting_engine`
- [ ] Obtained connection string with `?sslmode=require`
- [ ] Connection string format verified: `postgresql://user:pass@host/dbname?sslmode=require`

## Schema Initialization

- [ ] Opened NeonDB SQL Editor (or psql CLI)
- [ ] Copied `scripts/init-neondb.sql` content
- [ ] Executed SQL script successfully (no errors)

## Verification

- [ ] Ran: `SELECT * FROM pg_catalog.pg_tables WHERE schemaname='public';`
- [ ] Confirmed tables exist:
  - [ ] companies
  - [ ] reporting_periods
  - [ ] trial_balances
  - [ ] ledger_entries
  - [ ] mapping_results
  - [ ] report_runs
- [ ] Ran indexes query: `SELECT * FROM pg_indexes WHERE schemaname='public';`
- [ ] Confirmed all indexes created

## Save Credentials

- [ ] Stored DATABASE_URL safely (e.g., password manager)
- [ ] DATABASE_URL ready for Render deployment

## Post-Deployment

- [ ] Monitor storage usage in NeonDB dashboard (target: <2 GB for free tier)
- [ ] Set backup frequency (auto-backup enabled by default)

---

**Next**: Follow Render Backend Deployment checklist
