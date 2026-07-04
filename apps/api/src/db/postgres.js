import pg from 'pg';

const { Pool } = pg;

export function createPool() {
  if (!process.env.DATABASE_URL) return null;
  return new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

