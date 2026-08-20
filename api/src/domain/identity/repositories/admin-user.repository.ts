// Porta de persistência do AdminUser.

import type { AdminUser } from '../entities/admin-user.js';
import type { Email } from '../value-objects/email.js';

export interface NewAdminUser {
  email: Email;
  name: string;
  passwordHash: string;
  encryptedTotpSecret: string;
}

export interface AdminUserRepository {
  findByEmail(email: Email): Promise<AdminUser | null>;
  findById(id: string): Promise<AdminUser | null>;
  save(user: AdminUser): Promise<void>;
  create(data: NewAdminUser): Promise<AdminUser>;
  count(): Promise<number>;
}
