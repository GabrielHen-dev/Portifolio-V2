// Porta de persistência de sessões.

import type { Session } from '../entities/session.js';

export interface NewSession {
  userId: string;
  tokenHash: string;
  mfaPending: boolean;
  expiresAt: Date;
  ip: string | null;
  userAgent: string | null;
}

export interface SessionRepository {
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  create(data: NewSession): Promise<Session>;
  save(session: Session): Promise<void>;
  delete(sessionId: string): Promise<void>;

  deleteAllForUser(userId: string): Promise<void>;
  deleteExpired(now: Date): Promise<number>;
}
