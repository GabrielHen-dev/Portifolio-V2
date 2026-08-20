// Resolve o token do cookie numa sessão válida; usado pelo guard das rotas admin.

import type { AdminUser } from '../../../domain/identity/entities/admin-user.js';
import type { Session } from '../../../domain/identity/entities/session.js';
import type { AdminUserRepository } from '../../../domain/identity/repositories/admin-user.repository.js';
import type { SessionRepository } from '../../../domain/identity/repositories/session.repository.js';
import type { TokenGenerator } from '../../../domain/identity/services/security-ports.js';

export interface AuthenticatedContext {
  user: AdminUser;
  session: Session;

  renewed: boolean;
}

export class AuthenticateSessionUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenGenerator,
  ) {}

  async execute(sessionToken: string): Promise<AuthenticatedContext | null> {
    const session = await this.sessions.findByTokenHash(this.tokens.hash(sessionToken));
    if (!session) return null;

    if (session.isExpired()) {
      await this.sessions.delete(session.id);
      return null;
    }

    if (session.mfaPending) return null;

    const user = await this.users.findById(session.userId);
    if (!user || user.isLocked()) return null;

    const renewed = session.renewIfNeeded();
    if (renewed) await this.sessions.save(session);

    return { user, session, renewed };
  }
}
