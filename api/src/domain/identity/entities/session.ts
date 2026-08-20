// Entidade Session: sessão opaca com TTL, promoção pós-2FA e renovação deslizante.

export interface SessionProps {
  id: string;
  userId: string;

  tokenHash: string;

  mfaPending: boolean;
  expiresAt: Date;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export class Session {
  static readonly MFA_PENDING_TTL_MS = 5 * 60 * 1000;

  static readonly FULL_TTL_MS = 12 * 60 * 60 * 1000;

  static readonly RENEW_THRESHOLD_MS = 30 * 60 * 1000;

  private constructor(private props: SessionProps) {}

  static restore(props: SessionProps): Session {
    return new Session(props);
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get tokenHash(): string {
    return this.props.tokenHash;
  }
  get mfaPending(): boolean {
    return this.props.mfaPending;
  }
  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  isExpired(now: Date = new Date()): boolean {
    return this.props.expiresAt.getTime() <= now.getTime();
  }

  isUsable(now: Date = new Date()): boolean {
    return !this.isExpired(now) && !this.props.mfaPending;
  }

  completeMfa(now: Date = new Date()): void {
    this.props.mfaPending = false;
    this.props.expiresAt = new Date(now.getTime() + Session.FULL_TTL_MS);
  }

  renewIfNeeded(now: Date = new Date()): boolean {
    const remaining = this.props.expiresAt.getTime() - now.getTime();
    if (remaining > Session.FULL_TTL_MS - Session.RENEW_THRESHOLD_MS) return false;

    this.props.expiresAt = new Date(now.getTime() + Session.FULL_TTL_MS);
    return true;
  }

  toSnapshot(): SessionProps {
    return { ...this.props };
  }
}
