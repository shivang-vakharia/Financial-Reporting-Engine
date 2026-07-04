# Financial-Reporting-Engine

Generate Schedule III-compliant financial statements from a trial balance Excel file by uploading data, mapping accounts to categories, previewing the results, and exporting the final report as Excel.

## MVP Implementation

This repository now contains a fullstack MVP scaffold for an internal CA-facing reporting tool.

- React frontend using the supplied `UI/` design direction.
- Node.js + Express API.
- PostgreSQL-ready schema in `apps/api/migrations/001_init.sql`.
- In-memory development storage so the workflow can run immediately before database wiring.
- Excel trial balance upload and parsing.
- Rules-based automatic ledger mapping.
- Excel report export with:
  - Financial Results
  - Assets and Liabilities
  - Cash Flow
  - Changes in Equity
  - Notes and Disclosures
  - XBRL Mapping
  - Unmapped Ledgers

## Run Locally

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:4000`

## Sample Fixtures

The repository includes sample trial balance inputs and expected reports in the `samples/` folder. Use these files to manually validate upload, comparative period selection, and generated workbook contents.

## Notes

The API defaults to in-memory storage for speed of iteration. To use PostgreSQL:

```bash
cd apps/api
copy .env.example .env
```

Set `STORAGE_DRIVER=postgres` and update `DATABASE_URL`, then run:

```bash
npm run migrate -w apps/api
npm run dev
```
