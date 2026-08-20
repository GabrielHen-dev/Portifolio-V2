// Repositório Drizzle do AdminUser.

import { count, eq } from 'drizzle-orm';
import type { AdminUser } from '../../../domain/identity/entities/admin-user.js';
import type {
  AdminUserRepository,
  NewAdminUser,
} from '../../../domain/identity/repositories/admin-user.repository.js';
import type { Email } from '../../../domain/identity/value-objects/email.js';
import { db } from '../connection.js';
import { IdentityMapper } from '../mappers/identity.mapper.js';
import { adminUsers } from '../schema.js';

export class DrizzleAdminUserRepository implements AdminUserRepository {
  async findByEmail(email: Email): Promise<AdminUser | null> {
    const [row] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.value)).limit(1);
    return row ? IdentityMapper.toAdminUser(row) : null;
  }

  async findById(id: string): Promise<AdminUser | null> {
    const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    return row ? IdentityMapper.toAdminUser(row) : null;
  }

  async save(user: AdminUser): Promise<void> {
    await db.update(adminUsers).set(IdentityMapper.toAdminUserRow(user)).where(eq(adminUsers.id, user.id));
  }

  async create(data: NewAdminUser): Promise<AdminUser> {
    const [row] = await db
      .insert(adminUsers)
      .values({
        email: data.email.value,
        name: data.name,
        passwordHash: data.passwordHash,
        totpSecret: data.encryptedTotpSecret,
        totpEnabled: true,
      })
      .returning();

    if (!row) throw new Error('Falha ao criar o usuario administrador.');
    return IdentityMapper.toAdminUser(row);
  }

  async count(): Promise<number> {
    const [row] = await db.select({ value: count() }).from(adminUsers);
    return row?.value ?? 0;
  }
}
