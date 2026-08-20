// Armazenamento de mídia em disco: magic bytes, UUID e defesa de path traversal.

import { fileTypeFromBuffer } from 'file-type';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { MediaAsset, type AllowedMime } from '../../domain/portfolio/entities/media-asset.js';
import type { MediaStorage } from '../../domain/portfolio/repositories/portfolio.repositories.js';
import { ValidationError } from '../../shared/errors/index.js';

export class LocalMediaStorage implements MediaStorage {
  private readonly root = resolve(env.UPLOAD_DIR);

  async ensureReady(): Promise<void> {
    await mkdir(this.root, { recursive: true });
  }

  async detectMime(buffer: Buffer): Promise<AllowedMime> {
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected) {
      throw new ValidationError('Nao foi possivel identificar o tipo do arquivo.', 'file');
    }
    if (!MediaAsset.isAllowedMime(detected.mime)) {
      throw new ValidationError(`Tipo de arquivo nao permitido: ${detected.mime}.`, 'file');
    }

    return detected.mime;
  }

  buildFilename(mime: AllowedMime): string {
    return `${randomUUID()}.${MediaAsset.extensionFor(mime)}`;
  }

  async save(buffer: Buffer, filename: string): Promise<void> {
    await this.ensureReady();
    await writeFile(this.resolveSafe(filename), buffer, { flag: 'wx' });
  }

  async remove(filename: string): Promise<void> {
    try {
      await unlink(this.resolveSafe(filename));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  private resolveSafe(filename: string): string {
    const clean = basename(filename);
    const full = resolve(this.root, clean);

    if (!full.startsWith(this.root)) {
      throw new ValidationError('Nome de arquivo invalido.', 'file');
    }
    return full;
  }
}
