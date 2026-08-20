// Repositório Drizzle dos códigos de recuperação.

import { and, count, eq, isNull } from 'drizzle-orm';
import type {
  RecoveryCodeRecord,
  RecoveryCodeRepository,
} from '../../../domain/identity/repositories/recovery-code.repository.js';
import { db } from '../connection.js';
import { recoveryCodes } from '../schema.js';

export class DrizzleRecoveryCodeRepository implements RecoveryCodeRepository {
  async listUnused(userId: string): Promise<RecoveryCodeRecord[]> {
    const rows = await db
      .select({ id: recoveryCodes.id, codeHash: recoveryCodes.codeHash })
      .from(recoveryCodes)
      .where(and(eq(recoveryCodes.userId, userId), isNull(recoveryCodes.usedAt)));
    return rows;
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await db.update(recoveryCodes).set({ usedAt }).where(eq(recoveryCodes.id, id));
  }

  async replaceAll(userId: string, codeHashes: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
      if (codeHashes.length > 0) {
        await tx.insert(recoveryCodes).values(codeHashes.map((codeHash) => ({ userId, codeHash })));
      }
    });
  }

  async countUnused(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(recoveryCodes)
      .where(and(eq(recoveryCodes.userId, userId), isNull(recoveryCodes.usedAt)));
    return row?.value ?? 0;
  }
}
