// Aplica as migrações pendentes no boot (idempotente).

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './connection.js';

const here = dirname(fileURLToPath(import.meta.url));

export async function runMigrations(): Promise<void> {
  const migrationsFolder = resolve(here, '../../../drizzle');
  await migrate(db, { migrationsFolder });
}
