// Encerra a sessão (ou todas) apagando as linhas no banco.

import type { SessionRepository } from '../../../domain/identity/repositories/session.repository.js';
import type { TokenGenerator } from '../../../domain/identity/services/security-ports.js';

export class LogoutUseCase {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenGenerator,
  ) {}

  async execute(sessionToken: string): Promise<void> {
    const session = await this.sessions.findByTokenHash(this.tokens.hash(sessionToken));
    if (session) {
      await this.sessions.delete(session.id);
    }
  }

  async executeForAllDevices(userId: string): Promise<void> {
    await this.sessions.deleteAllForUser(userId);
  }
}
