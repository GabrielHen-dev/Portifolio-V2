// Boot da API: migrações, container, servidor HTTP, limpeza de sessões e shutdown gracioso.

import { env } from './config/env.js';
import { buildContainer } from './container.js';
import { closeDatabase } from './infrastructure/database/connection.js';
import { runMigrations } from './infrastructure/database/migrator.js';
import { buildServer } from './interfaces/http/server.js';

const SESSION_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

async function bootstrap(): Promise<void> {
  console.log('[boot] aplicando migracoes...');
  await runMigrations();
  console.log('[boot] migracoes em dia.');

  const container = buildContainer();
  await container.storage.ensureReady();

  const app = await buildServer(container);

  const cleanup = setInterval(() => {
    container.sessionRepository
      .deleteExpired(new Date())
      .then((removed) => {
        if (removed > 0) app.log.info({ removed }, 'sessoes expiradas removidas');
      })
      .catch((err) => app.log.error({ err }, 'falha na limpeza de sessoes'));
  }, SESSION_CLEANUP_INTERVAL_MS);
  cleanup.unref();

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info(`API ouvindo na porta ${env.PORT} (${env.NODE_ENV})`);

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`recebido ${signal}, encerrando...`);
    clearInterval(cleanup);

    try {
      await app.close();
      await closeDatabase();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'falha no encerramento');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[boot] falha ao iniciar a API:', err);
  process.exit(1);
});
