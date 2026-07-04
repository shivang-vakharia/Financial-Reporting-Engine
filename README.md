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

## Deployment

### Cloud Deployment (Vercel + Render + NeonDB)

Deploy the application for free to production using:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js)
- **Database**: NeonDB (PostgreSQL)

**Quick Start** (5-10 minutes):
1. See [`CLOUD-DEPLOYMENT-QUICKSTART.md`](./CLOUD-DEPLOYMENT-QUICKSTART.md)

**Detailed Guides**:
- [`VERCEL-RENDER-NEONDB-DEPLOYMENT.md`](./VERCEL-RENDER-NEONDB-DEPLOYMENT.md) - Complete step-by-step deployment
- [`NEONDB-SETUP-CHECKLIST.md`](./NEONDB-SETUP-CHECKLIST.md) - Database setup verification
- [`RENDER-DEPLOYMENT-CHECKLIST.md`](./RENDER-DEPLOYMENT-CHECKLIST.md) - Backend deployment verification
- [`VERCEL-DEPLOYMENT-CHECKLIST.md`](./VERCEL-DEPLOYMENT-CHECKLIST.md) - Frontend deployment verification

**Free Tier Limits**:
- NeonDB: 3 GB storage, 10 connections
- Render: 0.5 GB RAM, auto-sleeps after 15 min inactivity
- Vercel: 100 GB bandwidth/month

### Docker Deployment

Deploy using Docker containers locally or on any VPS:

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for:
- Docker setup (with docker-compose)
- Manual VPS deployment
- Kubernetes deployment
- Security recommendations
- Database setup & backups

Quick Docker start:
```bash
docker-compose up
```

## Local Development

### In-Memory Storage (Default)

The API defaults to in-memory storage for speed of iteration. Frontend and API run immediately:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:4000`

### PostgreSQL Storage

To use PostgreSQL locally:

```bash
cd apps/api
copy .env.example .env
```

Set `STORAGE_DRIVER=postgresql` and update `DATABASE_URL`, then run:

```bash
npm run migrate -w apps/api
npm run dev
```

## Sample Fixtures

The repository includes sample trial balance inputs and expected reports in the `samples/` folder. Use these files to manually validate upload, comparative period selection, and generated workbook contents.

## Project Structure

```
.
├── apps/
│   ├── api/                 # Node.js + Express backend
│   │   ├── src/
│   │   │   ├── index.js    # Server and routes
│   │   │   ├── db/         # Database drivers (memory, postgresql)
│   │   │   └── utils/      # Helper functions
│   │   ├── tests/          # API tests
│   │   └── storage/        # Persistent file storage
│   └── web/                 # React + Vite frontend
│       ├── src/
│       │   ├── main.jsx    # App entry point
│       │   ├── styles.css  # Global styles
│       │   └── assets/     # Images, icons
│       └── dist/           # Build output (production)
├── scripts/                 # Utility scripts
├── samples/                 # Sample trial balance & report files
├── Dockerfile              # Production container image
├── docker-compose.yml      # Local development stack
└── DEPLOYMENT.md           # Deployment documentation
```

## Next Steps

- 📦 **Deploy to Cloud**: Follow [`CLOUD-DEPLOYMENT-QUICKSTART.md`](./CLOUD-DEPLOYMENT-QUICKSTART.md)
- 🧪 **Run Tests**: `npm test`
- 📚 **Read Documentation**: See `DEPLOYMENT.md` and deployment guides
- 🐛 **Report Issues**: Create a GitHub issue

## Notes

The API supports multiple storage backends:
- `memory` - Fast, ephemeral (default for development)
- `postgresql` - Persistent, scalable (recommended for production)

## License

See [`LICENSE`](./LICENSE) file
