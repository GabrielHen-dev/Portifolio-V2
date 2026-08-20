// Entidade AdminUser: bloqueio por tentativas, 2FA e anti-replay de TOTP.

import { AccountLockedError } from '../../../shared/errors/index.js';
import { LockoutPolicy } from '../policies/lockout.policy.js';
import { Email } from '../value-objects/email.js';

export interface AdminUserProps {
  id: string;
  email: Email;
  name: string;
  passwordHash: string;

  encryptedTotpSecret: string | null;
  totpEnabled: boolean;
  lastTotpCounter: number | null;
  failedAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
}

export class AdminUser {
  private constructor(private props: AdminUserProps) {}

  static restore(props: AdminUserProps): AdminUser {
    return new AdminUser(props);
  }

  get id(): string {
    return this.props.id;
  }
  get email(): Email {
    return this.props.email;
  }
  get name(): string {
    return this.props.name;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get encryptedTotpSecret(): string | null {
    return this.props.encryptedTotpSecret;
  }
  get totpEnabled(): boolean {
    return this.props.totpEnabled;
  }
  get lastTotpCounter(): number | null {
    return this.props.lastTotpCounter;
  }
  get failedAttempts(): number {
    return this.props.failedAttempts;
  }
  get lockedUntil(): Date | null {
    return this.props.lockedUntil;
  }
  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  isLocked(now: Date = new Date()): boolean {
    return this.props.lockedUntil !== null && this.props.lockedUntil.getTime() > now.getTime();
  }

  assertNotLocked(now: Date = new Date()): void {
    if (!this.isLocked(now)) return;
    const retryAfter = Math.ceil((this.props.lockedUntil!.getTime() - now.getTime()) / 1000);
    throw new AccountLockedError(retryAfter);
  }

  registerFailedAttempt(now: Date = new Date()): void {
    this.props.failedAttempts += 1;

    if (LockoutPolicy.shouldLock(this.props.failedAttempts)) {
      this.props.lockedUntil = new Date(now.getTime() + LockoutPolicy.lockDurationMs(this.props.failedAttempts));
    }
  }

  registerSuccessfulLogin(now: Date = new Date()): void {
    this.props.failedAttempts = 0;
    this.props.lockedUntil = null;
    this.props.lastLoginAt = now;
  }

  acceptTotpCounter(counter: number): boolean {
    if (this.props.lastTotpCounter !== null && counter <= this.props.lastTotpCounter) {
      return false;
    }
    this.props.lastTotpCounter = counter;
    return true;
  }

  enableTotp(encryptedSecret: string): void {
    this.props.encryptedTotpSecret = encryptedSecret;
    this.props.totpEnabled = true;
    this.props.lastTotpCounter = null;
  }

  changePassword(newHash: string): void {
    this.props.passwordHash = newHash;
  }

  toSnapshot(): AdminUserProps {
    return { ...this.props };
  }
}
