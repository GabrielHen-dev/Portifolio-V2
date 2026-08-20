// Pool de conexão Postgres e instância do Drizzle.

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../config/env.js';
import * as schema from './schema.js';

export const sql = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(sql, { schema });

export type Database = typeof db;
export { schema };

export async function closeDatabase(): Promise<void> {
  await sql.end({ timeout: 5 });
}
