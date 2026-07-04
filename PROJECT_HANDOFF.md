# Financial Reporting Engine Project Handoff

## Purpose

This document is a continuity handoff for another AI agent or developer. It captures the project goal, current state, decisions made, completed work, sprint workflow, local setup, known issues, and recommended next steps.

## Project Summary

Financial Reporting Engine is an internal fullstack web application for Chartered Accountants. It takes trial balance Excel files as input and generates Excel financial report workbooks aligned with Indian Companies Act Schedule III Division II / Ind AS presentation style, using `SihoraFR.xlsx` as structural inspiration.

The project is currently an MVP in active development. The core upload, mapping, report generation, and PostgreSQL persistence paths exist, but the product is not yet production-ready.

## Repository

- Correct repository path: `C:\Users\shivh\Desktop\Financial-Reporting-Engine`
- GitHub remote: `https://github.com/shivang-vakharia/Financial-Reporting-Engine.git`
- Current working branch: `feature/postgres-persistence-layer`
- Base branch: `develop`

Important: Do not work in `C:\Users\shivh\Desktop\Financial Reporting Engine`. That similarly named folder was used accidentally earlier and is not the intended repository.

## Product Scope Confirmed

- Primary users: Chartered Accountants.
- Intended use: personal/internal, not public SaaS yet.
- Stack:
  - React frontend
  - Node.js
  - Express
  - PostgreSQL
- MVP input: Excel trial balance upload.
- MVP output: Excel report download only.
- Compliance direction:
  - Schedule III Division II / Ind AS
  - Indian XBRL taxonomy references stored/mapped internally
- Users need:
  - signup/login
  - multi-company workspaces
  - reporting periods
  - multiple trial balance uploads
  - standalone and consolidated report mode
- Consolidated report mode currently assumes the user uploads one already-consolidated trial balance.
- Mapping is rules-only automatic mapping.
- Unmapped ledgers do not block export.
- Unmapped ledgers must be flagged in the exported workbook.
- No in-app editable report in MVP.
- Required periods:
  - monthly
  - quarterly
  - half-yearly
  - annual
- Notes, accounting policies, and disclosures use fixed templates with inserted metadata/numbers.

## Reference Files

- Input example: `TrialBal.xlsx`
- Output style example: `SihoraFR.xlsx`
- UI design assets: `UI/`

The input and output examples are not related by data. They are only for structure and format discovery.

## Current Stage

We are at the end of early MVP foundation work and have started Sprint 2-style Excel template alignment.

Current stage can be described as:

- Product scope: defined for MVP.
- Fullstack scaffold: implemented.
- PostgreSQL persistence adapter: implemented.
- Excel report pipeline: implemented.
- Report template: partially aligned with `SihoraFR.xlsx`.
- Mapping rules: basic, improved for common Tally-style ledgers, but still incomplete.
- Production hardening: not started.
- Full compliance validation: not complete.

The project is now ready for iterative sprint development focused on correctness, template fidelity, persistence validation, and UX workflow polish.

## Completed Work Timeline

### Initial Planning

Confirmed MVP direction:

- Excel upload/download only.
- Option 1-style fast MVP, not a full in-app report editor.
- Schedule III Division II only.
- Quarterly/half-yearly financial results inspired by `SihoraFR.xlsx`.
- Multiple trial balance uploads.
- Standalone and consolidated reports.
- Fixed notes/disclosure templates.
- Rules-based mapping.

### Commit: `3acf5ce Add fullstack financial reporting MVP scaffold`

Pushed to `develop`.

Implemented:

- React frontend under `apps/web`
- Express API under `apps/api`
- Login/signup
- Company workspace
- Reporting period creation
- Trial balance upload
- Excel parser using ExcelJS
- Rules-based mapping engine
- Excel report generation
- PostgreSQL migration file
- In-memory development storage
- Backend test for parser, mapper, and workbook generation

Generated workbook initially included:

- `Financial Results`
- `Assets and Liabilities`
- `Cash Flow`
- `Changes in Equity`
- `Notes and Disclosures`
- `XBRL Mapping`
- `Unmapped Ledgers`

### Commit: `29ac790 Add PostgreSQL persistence adapter`

Pushed to `feature/postgres-persistence-layer`.

Implemented:

- Repository/storage adapter layer
- In-memory repository
- PostgreSQL repository
- PostgreSQL pool setup
- Migration runner: `npm run migrate -w apps/api`
- API route refactor to use repository methods
- Repository test
- README and `.env.example` updates

### Commit: `5400751 Fix authenticated report download`

Pushed to `feature/postgres-persistence-layer`.

Problem:

- Download link used a plain `<a href>` to the API.
- Browser navigation did not send JWT `Authorization` header.
- API returned `401 Authentication required`.

Fix:

- Added authenticated `downloadFile()` helper in `apps/web/src/services/api.js`.
- Changed report download from plain anchor to authenticated fetch + blob download.
- Preserves server filename from `Content-Disposition`.

### Commit: `63b6cce Align Excel report template with sample output`

Pushed to `feature/postgres-persistence-layer`.

Problem:

- Generated report did not resemble `SihoraFR.xlsx` enough.
- `Particulars` column only showed roman numerals/codes.
- Actual particulars text was shifted into the next column.
- Placeholder columns `Comparative 1` and `Comparative 2` were confusing.
- Missing rows:
  - `Date of start of reporting period`
  - `Date of end of reporting period`
  - `Whether results are audited or unaudited`
  - `Nature of report standalone or consolidated`
- Missing quarterly/half-yearly/period/year-ended style columns.
- Formatting was negligible compared to the sample file.

Fix:

- Replaced generic `Financial Results` sheet with `Result`.
- Replaced generic `Assets and Liabilities` sheet with `SLA`.
- Added `Segment reoprt` sheet.
- Added period metadata rows.
- Added `Quarter Ended`, `Period ended`, and `Year Ended` style headers.
- Fixed layout so:
  - column A = code / roman numeral
  - column B = particulars text
  - values start from column C
- Added formulas to `Result`, `SLA`, and `Segment reoprt`.
- Added merged headings, widths, borders, header fills, wrapped text, frozen panes, and number formats.
- Improved ledger mapping priority:
  - ledger name matches first
  - parent group is fallback only
- Expanded mapping aliases for:
  - `Fixed Assets`
  - `Sundry Creditors`
  - `Sundry Debtors`
  - `Bank Accounts`
  - `Deposits (Asset)`

## Current Generated Report State

The updated generated report now includes:

- `Result`
- `SLA`
- `Segment reoprt`
- `Cash Flow`
- `Changes in Equity`
- `Notes and Disclosures`
- `XBRL Mapping`
- `Unmapped Ledgers`

`Result` now has:

- Company name
- CIN
- Registered office
- Statement heading
- Period column grouping
- Reporting-period metadata rows
- Financial result line items
- Formulas
- Notes
- Signatory area
- Unmapped ledger section at bottom

`SLA` now has:

- Statement of Assets and Liabilities style layout
- `As at` columns
- ASSETS and EQUITY AND LIABILITIES sections
- Formulas
- Unmapped ledger section at bottom

Known limitation:

- The template is closer to `SihoraFR.xlsx`, but not an exact replica.
- Comparative values are not yet properly computed from selected prior period uploads.
- Many values still appear only in the current period column unless comparative periods are wired in.
- Segment reporting is a placeholder structural sheet.

## Local Setup

Install dependencies:

```bash
npm install
```

Run app:

```bash
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

API:

```txt
http://localhost:4000
```

Health check:

```txt
http://localhost:4000/health
```

## PostgreSQL Setup

The API defaults to in-memory storage unless configured otherwise.

To use PostgreSQL:

1. Open pgAdmin.
2. Create database:

```txt
financial_reporting_engine
```

3. Create `apps/api/.env` from `apps/api/.env.example`.

Example:

```env
PORT=4000
JWT_SECRET=replace-this-with-a-long-random-secret
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/financial_reporting_engine
STORAGE_DRIVER=postgres
```

4. Run migrations from repo root:

```bash
npm run migrate -w apps/api
```

5. Start app:

```bash
npm run dev
```

## Test Workflow

Manual workflow that has been tested by the user:

- Sign up
- Log in
- Add company
- Add reporting period
- Upload `TrialBal.xlsx`
- Review mapping
- Generate Excel report
- Download Excel report

The download issue was fixed in commit `5400751`.

## Verification Commands

Run these before every commit:

```bash
npm test -w apps/api
npm run build
```

Current backend tests cover:

- Memory repository workflow
- Trial balance parsing
- Rules-based mapping
- Report workbook generation
- Presence of `Result`, `SLA`, `Segment reoprt`, `Cash Flow`, `Changes in Equity`, and `Unmapped Ledgers`
- Regression for `Fixed Assets` mapping to PPE

## Sprint Operating Model

From now on, development should proceed sprint-by-sprint.

Each sprint follows this cycle:

1. Define sprint goal.
2. Define exact sprint tasks.
3. Implement only those tasks.
4. Run verification:
   - `npm test -w apps/api`
   - `npm run build`
5. Manually test the relevant app workflow.
6. Commit with a clear message.
7. Push the feature branch.
8. Summarize what changed and propose the next sprint.

Sprint work should stay scoped. Avoid unrelated refactors.

## Branching and PR Strategy

Current active branch:

```txt
feature/postgres-persistence-layer
```

This branch currently contains:

- PostgreSQL persistence adapter work
- authenticated download fix
- Excel template alignment work

Base branch:

```txt
develop
```

Recommended next action:

- Open or update a PR from `feature/postgres-persistence-layer` into `develop`.
- The PR currently includes multiple sprint-level commits.

## Current Known Issues and Gaps

### Report Template

- `Result` and `SLA` are closer to `SihoraFR.xlsx`, but not exact.
- `Segment reoprt` is mostly structural placeholder.
- The sample uses many specific merged cells and formulas that are not fully replicated.
- The output uses actual amounts, not lakhs. This should become configurable.
- Some row labels and spellings preserve sample-style wording, including some typos, but should be reviewed.

### Comparatives

- Column headers now exist for quarter/period/year-ended formats.
- Comparative values are not yet truly populated from uploaded comparative periods.
- Need explicit logic to select prior period uploads and aggregate them.

### Mapping

- Mapping is still keyword/rule based.
- Improved aliases exist, but a CA-grade mapping dictionary is not complete.
- Needs more Schedule III Division II line items and XBRL element coverage.
- Need mapping confidence/exceptions review flow improvements.

### PostgreSQL

- PostgreSQL adapter exists.
- User has manually tested core workflow successfully.
- More integration testing is needed against a real PostgreSQL database.
- Migration runner applies SQL files, but does not track already-applied migrations.

### Security

- JWT auth exists.
- Password hashing exists.
- Needs production-hardening later:
  - secure cookies or refresh strategy
  - stricter CORS
  - upload MIME validation
  - file cleanup policy
  - audit logs

### UX

- UI is functional and based on supplied `UI/` assets.
- Needs better loading states, error states, disabled states, and workflow guidance.
- Needs better report metadata entry and validation.

## Recommended Next Sprint

### Sprint 3: Comparative Period Data and Report Accuracy

Goal: Make the period columns in `Result` and `SLA` meaningful by using uploaded trial balances from selected prior periods.

Suggested tasks:

- [ ] Add UI for selecting comparative periods before report generation.
- [ ] Store selected comparative period IDs in report metadata.
- [ ] Fetch ledgers/mappings for selected comparative periods during report generation.
- [ ] Aggregate current and comparative period values separately.
- [ ] Populate `Result` columns C-H from real period data.
- [ ] Populate `SLA` columns C-E from real period data.
- [ ] Add backend tests for comparative period aggregation.
- [ ] Keep fallback behavior when comparative periods are missing.

Alternative Sprint 3:

### Sprint 3: Mapping Rule Expansion

Goal: Reduce unmapped and wrongly mapped ledgers for common Indian/Tally trial balances.

Suggested tasks:

- [ ] Add mapping rule categories for all major Schedule III Division II lines.
- [ ] Expand aliases for GST, TDS, advances, deposits, loans, borrowings, inventory, receivables, payables, revenue, purchases, expenses.
- [ ] Add mapping test fixture based on `TrialBal.xlsx`.
- [ ] Add expected mapping assertions for known ledger names.
- [ ] Improve unmapped report output with suggested categories.

Recommended choice: do Comparative Period Data first, because the visible report now has period columns but does not yet fill them correctly.

## Important Implementation Files

API:

- `apps/api/src/index.js`
- `apps/api/src/services/trialBalanceParser.js`
- `apps/api/src/services/mappingEngine.js`
- `apps/api/src/services/mappingRules.js`
- `apps/api/src/services/reportGenerator.js`
- `apps/api/src/repositories/repository.js`
- `apps/api/src/repositories/memoryRepository.js`
- `apps/api/src/repositories/postgresRepository.js`
- `apps/api/src/db/postgres.js`
- `apps/api/src/db/migrate.js`
- `apps/api/migrations/001_init.sql`

Frontend:

- `apps/web/src/main.jsx`
- `apps/web/src/services/api.js`
- `apps/web/src/styles.css`

Tests:

- `apps/api/src/services/reporting.test.js`
- `apps/api/src/repositories/memoryRepository.test.js`

## Notes for Future AI Agent

- Always work in `C:\Users\shivh\Desktop\Financial-Reporting-Engine`.
- Do not assume the similar folder with spaces is the project.
- Preserve user files and sample workbooks.
- Use `rg` for searches when available.
- Use `apply_patch` for manual edits.
- Before committing, run:

```bash
npm test -w apps/api
npm run build
```

- Follow the sprint workflow.
- Keep each sprint scoped.
- Commit and push at the end of each completed sprint.

