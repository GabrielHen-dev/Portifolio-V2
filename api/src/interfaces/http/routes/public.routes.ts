// Leitura pública do portfólio com cache HTTP curto.

import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../container.js';
import { PortfolioPresenter } from '../presenters/portfolio.presenter.js';

export async function publicRoutes(app: FastifyInstance, container: Container): Promise<void> {
  app.get('/portfolio', async (_request, reply) => {
    const snapshot = await container.portfolio.query.getPublicSnapshot();

    reply.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return reply.send(PortfolioPresenter.snapshot(snapshot));
  });
}
