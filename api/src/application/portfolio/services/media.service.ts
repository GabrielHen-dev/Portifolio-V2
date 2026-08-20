// Upload validado por magic bytes e exclusão de arquivos.

import { randomUUID } from 'node:crypto';
import { MediaAsset } from '../../../domain/portfolio/entities/media-asset.js';
import type { MediaRepository } from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { NotFoundError } from '../../../shared/errors/index.js';
import type { LocalMediaStorage } from '../../../infrastructure/storage/local-media-storage.js';

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
}

export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly storage: LocalMediaStorage,
  ) {}

  list(): Promise<MediaAsset[]> {
    return this.repository.list();
  }

  async upload(input: UploadInput): Promise<MediaAsset> {
    MediaAsset.assertSize(input.buffer.byteLength);

    const mime = await this.storage.detectMime(input.buffer);
    const filename = this.storage.buildFilename(mime);

    await this.storage.save(input.buffer, filename);

    try {
      return await this.repository.create(
        MediaAsset.restore({
          id: randomUUID(),
          filename,
          originalName: input.originalName.slice(0, 200),
          mime,
          size: input.buffer.byteLength,
          createdAt: new Date(),
        }),
      );
    } catch (err) {
      await this.storage.remove(filename);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    const asset = await this.repository.findById(id);
    if (!asset) throw new NotFoundError('Arquivo', id);

    await this.repository.delete(id);
    await this.storage.remove(asset.filename);
  }
}
