// Valida as variáveis de ambiente no boot; processo morre se algo faltar.

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().url(),

  PUBLIC_ORIGIN: z.string().url(),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET precisa de pelo menos 32 caracteres'),

  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY precisa ter exatamente 64 caracteres hexadecimais'),

  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  TRUST_PROXY: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`\nConfiguracao de ambiente invalida:\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';

export const allowedOrigins = new Set<string>(
  isProd
    ? [env.PUBLIC_ORIGIN]
    : [env.PUBLIC_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080'],
);
