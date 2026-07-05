/*

import { createPool } from '../db/postgres.js';
import { createMemoryRepository } from './memoryRepository.js';
import { createPostgresRepository } from './postgresRepository.js';

export function createRepository() {
  const driver = process.env.STORAGE_DRIVER || (process.env.DATABASE_URL ? 'postgres' : 'memory');
  if (driver === 'postgres') {
    const pool = createPool();
    if (!pool) {
      throw new Error('DATABASE_URL is required when STORAGE_DRIVER=postgres.');
    }
    return createPostgresRepository(pool);
  }
  return createMemoryRepository();
}

*/

import { createPool } from '../db/postgres.js';
import { createMemoryRepository } from './memoryRepository.js';
import { createPostgresRepository } from './postgresRepository.js';

export function createRepository() {
  const driver =
    process.env.STORAGE_DRIVER ||
    (process.env.DATABASE_URL ? 'postgres' : 'memory');

  console.log('==============================');
  console.log('STORAGE_DRIVER:', process.env.STORAGE_DRIVER);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('Selected repository:', driver);
  console.log('==============================');

  if (driver === 'postgres') {
    const pool = createPool();
    console.log('Using PostgreSQL repository');
    return createPostgresRepository(pool);
  }

  console.log('Using Memory repository');
  return createMemoryRepository();
}