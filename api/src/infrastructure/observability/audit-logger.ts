// Trilha de auditoria das escritas do painel; nunca lança.

import { db } from '../database/connection.js';
import { auditLogs } from '../database/schema.js';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  ip?: string | null;
  detail?: string | null;
}

export class AuditLogger {
  async record(entry: AuditEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity ?? null,
        entityId: entry.entityId ?? null,
        ip: entry.ip ?? null,
        detail: entry.detail ?? null,
      });
    } catch (err) {
      console.error('[audit] falha ao gravar registro de auditoria:', err);
    }
  }
}
