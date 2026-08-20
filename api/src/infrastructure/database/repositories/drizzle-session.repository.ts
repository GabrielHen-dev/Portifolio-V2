// Repositório Drizzle das sessões.

import { eq, lt } from 'drizzle-orm';
import type { Session } from '../../../domain/identity/entities/session.js';
import type { NewSession, SessionRepository } from '../../../domain/identity/repositories/session.repository.js';
import { db } from '../connection.js';
import { IdentityMapper } from '../mappers/identity.mapper.js';
import { sessions } from '../schema.js';

export class DrizzleSessionRepository implements SessionRepository {
  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const [row] = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
    return row ? IdentityMapper.toSession(row) : null;
  }

  async create(data: NewSession): Promise<Session> {
    const [row] = await db.insert(sessions).values(data).returning();
    if (!row) throw new Error('Falha ao criar a sessao.');
    return IdentityMapper.toSession(row);
  }

  async save(session: Session): Promise<void> {
    const s = session.toSnapshot();
    await db
      .update(sessions)
      .set({ mfaPending: s.mfaPending, expiresAt: s.expiresAt })
      .where(eq(sessions.id, s.id));
  }

  async delete(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async deleteExpired(now: Date): Promise<number> {
    const removed = await db.delete(sessions).where(lt(sessions.expiresAt, now)).returning({ id: sessions.id });
    return removed.length;
  }
}
