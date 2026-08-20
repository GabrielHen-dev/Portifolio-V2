// Converte linhas do banco em entidades de identidade e vice-versa.

import { AdminUser } from '../../../domain/identity/entities/admin-user.js';
import { Session } from '../../../domain/identity/entities/session.js';
import { Email } from '../../../domain/identity/value-objects/email.js';
import type { adminUsers, sessions } from '../schema.js';

type AdminUserRow = typeof adminUsers.$inferSelect;
type SessionRow = typeof sessions.$inferSelect;

export const IdentityMapper = {
  toAdminUser(row: AdminUserRow): AdminUser {
    return AdminUser.restore({
      id: row.id,
      email: Email.create(row.email),
      name: row.name,
      passwordHash: row.passwordHash,
      encryptedTotpSecret: row.totpSecret,
      totpEnabled: row.totpEnabled,
      lastTotpCounter: row.lastTotpCounter,
      failedAttempts: row.failedAttempts,
      lockedUntil: row.lockedUntil,
      lastLoginAt: row.lastLoginAt,
    });
  },

  toAdminUserRow(user: AdminUser): Partial<AdminUserRow> {
    const s = user.toSnapshot();
    return {
      email: s.email.value,
      name: s.name,
      passwordHash: s.passwordHash,
      totpSecret: s.encryptedTotpSecret,
      totpEnabled: s.totpEnabled,
      lastTotpCounter: s.lastTotpCounter,
      failedAttempts: s.failedAttempts,
      lockedUntil: s.lockedUntil,
      lastLoginAt: s.lastLoginAt,
      updatedAt: new Date(),
    };
  },

  toSession(row: SessionRow): Session {
    return Session.restore({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      mfaPending: row.mfaPending,
      expiresAt: row.expiresAt,
      ip: row.ip,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
    });
  },
};
