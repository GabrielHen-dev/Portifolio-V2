// Política de bloqueio progressivo por tentativas de login.

export const LockoutPolicy = {
  MAX_ATTEMPTS: 5,

  lockDurationMs(failedAttempts: number): number {
    const rounds = Math.floor(failedAttempts / LockoutPolicy.MAX_ATTEMPTS);
    const table = [15 * 60_000, 60 * 60_000, 6 * 60 * 60_000, 24 * 60 * 60_000];
    const index = Math.min(Math.max(rounds - 1, 0), table.length - 1);
    return table[index] ?? table[table.length - 1]!;
  },

  shouldLock(failedAttempts: number): boolean {
    return failedAttempts > 0 && failedAttempts % LockoutPolicy.MAX_ATTEMPTS === 0;
  },
} as const;
