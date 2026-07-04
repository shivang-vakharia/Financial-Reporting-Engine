import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storagePath = path.resolve(__dirname, '../../storage/memory-store.json');

const initialStore = {
  users: [],
  companies: [],
  periods: [],
  uploads: [],
  ledgers: [],
  mappings: [],
  reportRuns: []
};

function ensureStorageFile() {
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });
  if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify(initialStore, null, 2));
  }
}

function normalizeStore(value) {
  return {
    users: Array.isArray(value?.users) ? value.users : [],
    companies: Array.isArray(value?.companies) ? value.companies : [],
    periods: Array.isArray(value?.periods) ? value.periods : [],
    uploads: Array.isArray(value?.uploads) ? value.uploads : [],
    ledgers: Array.isArray(value?.ledgers) ? value.ledgers : [],
    mappings: Array.isArray(value?.mappings) ? value.mappings : [],
    reportRuns: Array.isArray(value?.reportRuns) ? value.reportRuns : []
  };
}

function loadStore() {
  ensureStorageFile();
  try {
    return normalizeStore(JSON.parse(fs.readFileSync(storagePath, 'utf8')));
  } catch {
    return { ...initialStore };
  }
}

export const store = loadStore();

export function persistStore() {
  ensureStorageFile();
  fs.writeFileSync(storagePath, JSON.stringify(store, null, 2));
}

