import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'node:url';
import { v4 as uuid } from 'uuid';
import { createRepository } from './repositories/repository.js';
import { parseTrialBalance } from './services/trialBalanceParser.js';
import { mapLedgers } from './services/mappingEngine.js';
import { generateReportWorkbook } from './services/reportGenerator.js';
import { scheduleLines } from './services/mappingRules.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uploadDir = path.join(rootDir, 'uploads');
const generatedDir = path.join(rootDir, 'generated');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });

const app = express();
const repository = createRepository();

// Security middleware
app.use(helmet());

app.set("trust proxy", 1);

// Rate limiting - strict for auth endpoints, moderate for API
const authLimiter = rateLimit({
  windowMs: 50 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration
const corsOptions = {
  origin: process.env.WEB_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '2mb' }));

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xlsm|xls)$/i)) {
      cb(new Error('Only Excel files are supported.'));
      return;
    }
    cb(null, true);
  }
});

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, jwtSecret, { expiresIn: '8h' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'financial-reporting-engine-api' });
});

app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (await repository.findUserByEmail(email)) {
    return res.status(409).json({ error: 'A user with this email already exists.' });
  }
  const user = {
    id: uuid(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString()
  };
  await repository.createUser(user);
  res.status(201).json({ token: signToken(user), user: { id: user.id, name, email } });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await repository.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/companies', requireAuth, async (req, res) => {
  res.json(await repository.listCompanies(req.user.sub));
});

app.post('/companies', requireAuth, async (req, res) => {
  const { name, cin, registeredOffice, reportingFramework = 'division_ii_ind_as' } = req.body;
  if (!name) return res.status(400).json({ error: 'Company name is required.' });
  const company = {
    id: uuid(),
    ownerId: req.user.sub,
    name,
    cin: cin || '',
    registeredOffice: registeredOffice || '',
    reportingFramework,
    metadata: {},
    createdAt: new Date().toISOString()
  };
  res.status(201).json(await repository.createCompany(company));
});

app.patch('/companies/:companyId/metadata', requireAuth, async (req, res) => {
  const company = await findCompany(req, res);
  if (!company) return;
  const patch = { ...pick(req.body, ['name', 'cin', 'registeredOffice']), metadata: req.body };
  res.json(await repository.updateCompany(company.id, req.user.sub, patch));
});

app.get('/companies/:companyId/periods', requireAuth, async (req, res) => {
  const company = await findCompany(req, res);
  if (!company) return;
  res.json(await repository.listPeriods(company.id));
});

app.post('/companies/:companyId/periods', requireAuth, async (req, res) => {
  const company = await findCompany(req, res);
  if (!company) return;
  const { label, periodType, startDate, endDate, financialYear } = req.body;
  if (!label || !periodType || !startDate || !endDate) {
    return res.status(400).json({ error: 'Label, period type, start date, and end date are required.' });
  }
  const period = {
    id: uuid(),
    companyId: company.id,
    label,
    periodType,
    startDate,
    endDate,
    financialYear: financialYear || deriveFinancialYear(endDate),
    createdAt: new Date().toISOString()
  };
  res.status(201).json(await repository.createPeriod(period));
});

app.post('/periods/:periodId/uploads', requireAuth, upload.single('trialBalance'), async (req, res) => {

  console.log("Period ID from URL:", req.params.periodId);
  console.log("Authenticated user:", req.user.sub);
  
  const context = await findPeriod(req, res);
  console.log("Context:", context);

  const period = context?.period;
  console.log("Resolved period:", period);

  if (!period) return;
  if (!req.file) return res.status(400).json({ error: 'Trial balance Excel file is required.' });

  const parsed = await parseTrialBalance(req.file.path);
  const uploadRecord = {
    id: uuid(),
    periodId: period.id,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    rowCount: parsed.ledgers.length,
    debitTotal: parsed.debitTotal,
    creditTotal: parsed.creditTotal,
    variance: parsed.variance,
    createdAt: new Date().toISOString()
  };
  await repository.createUpload(uploadRecord);
  const ledgers = parsed.ledgers.map((ledger) => ({ ...ledger, id: uuid(), uploadId: uploadRecord.id, periodId: period.id }));
  await repository.createLedgers(ledgers);
  const mappings = mapLedgers(ledgers);
  await repository.replaceMappingsForUpload(uploadRecord.id, mappings);

  res.status(201).json({
    upload: uploadRecord,
    validation: {
      rowCount: uploadRecord.rowCount,
      debitTotal: uploadRecord.debitTotal,
      creditTotal: uploadRecord.creditTotal,
      variance: uploadRecord.variance,
      balanced: Math.abs(uploadRecord.variance) < 0.01
    },
    mappingSummary: summarizeMappings(mappings)
  });
});

app.get('/periods/:periodId/uploads', requireAuth, async (req, res) => {
  const context = await findPeriod(req, res);
  const period = context?.period;
  if (!period) return;
  res.json(await repository.listUploads(period.id));
});

app.post('/periods/:periodId/map-ledgers', requireAuth, async (req, res) => {
  const context = await findPeriod(req, res);
  const period = context?.period;
  if (!period) return;
  const ledgers = await repository.listLedgersByPeriod(period.id);
  const mappings = mapLedgers(ledgers);
  await repository.replaceMappingsForPeriod(period.id, mappings);
  res.json({ mappings, summary: summarizeMappings(mappings) });
});

app.get('/periods/:periodId/mapping-results', requireAuth, async (req, res) => {
  const context = await findPeriod(req, res);
  const period = context?.period;
  if (!period) return;
  const mappings = await repository.listMappingsByPeriod(period.id);
  res.json({ mappings, summary: summarizeMappings(mappings) });
});

app.get('/schedule-lines', requireAuth, (_req, res) => {
  res.json(scheduleLines);
});

app.patch('/periods/:periodId/mapping-results/:mappingId', requireAuth, async (req, res) => {
  const context = await findPeriod(req, res);
  const period = context?.period;
  if (!period) return;
  const mapping = await repository.getMappingById(req.params.mappingId);
  if (!mapping || mapping.periodId !== period.id) {
    return res.status(404).json({ error: 'Mapping result not found for this period.' });
  }
  const { scheduleLineId } = req.body;
  const scheduleLine = scheduleLines.find((line) => line.id === scheduleLineId);
  if (!scheduleLine) {
    return res.status(400).json({ error: 'Valid schedule line selection is required.' });
  }
  const updated = await repository.updateMapping(mapping.id, {
    status: 'mapped',
    scheduleLineId: scheduleLine.id,
    scheduleLabel: scheduleLine.label,
    statement: scheduleLine.statement,
    section: scheduleLine.section,
    xbrlElement: scheduleLine.xbrl,
    mappingSource: 'manual',
    confidenceLabel: 'manual'
  });
  res.json(updated);
});

app.delete('/companies/:companyId', requireAuth, async (req, res) => {
  const deleted = await repository.deleteCompany(req.params.companyId, req.user.sub);
  if (!deleted) return res.status(404).json({ error: 'Company not found.' });
  res.status(204).end();
});

app.get('/companies/:companyId/report-runs', requireAuth, async (req, res) => {
  const company = await findCompany(req, res);
  if (!company) return;
  res.json(await repository.listReportRunsForCompany(company.id));
});

app.post('/periods/:periodId/report-runs', requireAuth, async (req, res) => {
  const context = await findPeriod(req, res);
  if (!context) return;
  const { period, company } = context;
  const uploads = await repository.listUploads(period.id);
  const ledgers = await repository.listLedgersByPeriod(period.id);
  const mappings = await repository.listMappingsByPeriod(period.id);
  if (!uploads.length || !ledgers.length) {
    return res.status(400).json({ error: 'Upload at least one trial balance before generating a report.' });
  }
  const comparativePeriodIds = Array.isArray(req.body.comparativePeriodIds)
    ? req.body.comparativePeriodIds.filter((id) => typeof id === 'string')
    : [];
  const metadata = { ...(req.body.metadata || {}), comparativePeriodIds };

  const reportRun = {
    id: uuid(),
    companyId: company.id,
    periodId: period.id,
    reportType: req.body.reportType || 'standalone',
    metadata,
    status: 'processing',
    createdAt: new Date().toISOString()
  };
  await repository.createReportRun(reportRun);

  const comparativePeriods = comparativePeriodIds.length
    ? (await repository.listPeriodsByIds(company.id, comparativePeriodIds)).filter((item) => item.id !== period.id)
    : await repository.listComparativePeriods(company.id, period.id);
  const comparativeMappings = comparativePeriods.length
    ? await repository.listMappingsByPeriodIds(comparativePeriods.map((item) => item.id))
    : [];

  const fileName = `${safeName(company.name)}-${safeName(period.label)}-${reportRun.reportType}-${Date.now()}.xlsx`;
  const outputPath = path.join(generatedDir, fileName);
  await generateReportWorkbook({
    company,
    period,
    reportRun,
    ledgers,
    mappings,
    outputPath,
    comparativePeriods,
    comparativeMappings
  });
  const completed = await repository.completeReportRun(reportRun.id, {
    status: 'completed',
    fileName,
    outputPath,
    completedAt: new Date().toISOString()
  });
  res.status(201).json(completed);
});

app.get('/report-runs', requireAuth, async (req, res) => {
  res.json(await repository.listReportRunsForOwner(req.user.sub));
});

app.get('/report-runs/:reportRunId/download', requireAuth, async (req, res) => {
  const reportRun = await repository.getReportRunForOwner(req.params.reportRunId, req.user.sub);
  if (!reportRun || !fs.existsSync(reportRun.outputPath)) {
    return res.status(404).json({ error: 'Generated report not found.' });
  }
  res.download(reportRun.outputPath, reportRun.fileName);
});

app.use((error, _req, res, _next) => {
  res.status(400).json({ error: error.message || 'Request failed.' });
});

async function findCompany(req, res) {
  const company = await repository.getCompanyForOwner(req.params.companyId, req.user.sub);
  if (!company) res.status(404).json({ error: 'Company not found.' });
  return company;
}

async function findPeriod(req, res) {
  const context = await repository.getPeriodForOwner(req.params.periodId, req.user.sub);
  if (!context) res.status(404).json({ error: 'Reporting period not found.' });
  return context;
}

function summarizeMappings(mappings) {
  const mapped = mappings.filter((item) => item.status === 'mapped').length;
  const unmapped = mappings.length - mapped;
  return { total: mappings.length, mapped, unmapped };
}

function deriveFinancialYear(endDate) {
  const date = new Date(endDate);
  const year = date.getUTCFullYear();
  return date.getUTCMonth() + 1 <= 3 ? `${year - 1}-${String(year).slice(2)}` : `${year}-${String(year + 1).slice(2)}`;
}

function safeName(value) {
  return String(value || 'report').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function pick(source, keys) {
  return keys.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
}

// Global error handler middleware
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  if (err.message && err.message.includes('Only Excel files are supported')) {
    return res.status(400).json({ error: 'Only Excel files (.xlsx, .xlsm, .xls) are supported.' });
  }
  
  if (err.message && err.message.includes('File too large')) {
    return res.status(413).json({ error: 'File size exceeds 50MB limit.' });
  }
  
  console.error('Error:', isDev ? err : err.message);
  
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Financial Reporting Engine API listening on http://localhost:${port}`);
});
