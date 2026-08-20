// Configuração do drizzle-kit (schema e pasta de migrações).

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://portfolio:portfolio@localhost:5432/portfolio',
  },
  strict: true,
  verbose: true,
} satisfies Config;
