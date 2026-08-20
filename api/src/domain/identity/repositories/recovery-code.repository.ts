// Porta dos códigos de recuperação de uso único.

export interface RecoveryCodeRecord {
  id: string;
  codeHash: string;
}

export interface RecoveryCodeRepository {
  listUnused(userId: string): Promise<RecoveryCodeRecord[]>;
  markUsed(id: string, usedAt: Date): Promise<void>;
  replaceAll(userId: string, codeHashes: string[]): Promise<void>;
  countUnused(userId: string): Promise<number>;
}
