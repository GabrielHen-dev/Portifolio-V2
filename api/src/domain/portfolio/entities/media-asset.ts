// Entidade MediaAsset: arquivo enviado, com whitelist de MIME e limite de tamanho.

import { ValidationError } from '../../../shared/errors/index.js';

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'application/pdf',
] as const;
export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<AllowedMime, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

export interface MediaAssetProps {
  id: string;
  filename: string;
  originalName: string;
  mime: AllowedMime;
  size: number;
  createdAt: Date;
}

export class MediaAsset {
  private constructor(private props: MediaAssetProps) {}

  static restore(props: MediaAssetProps): MediaAsset {
    return new MediaAsset(props);
  }

  static isAllowedMime(mime: string): mime is AllowedMime {
    return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
  }

  static extensionFor(mime: AllowedMime): string {
    return EXTENSION_BY_MIME[mime];
  }

  static assertSize(size: number): void {
    if (size <= 0) throw new ValidationError('Arquivo vazio.', 'file');
    if (size > MAX_UPLOAD_BYTES) {
      throw new ValidationError(`Arquivo acima do limite de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 'file');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get filename(): string {
    return this.props.filename;
  }
  get originalName(): string {
    return this.props.originalName;
  }
  get mime(): AllowedMime {
    return this.props.mime;
  }
  get size(): number {
    return this.props.size;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  get publicUrl(): string {
    return `/uploads/${this.props.filename}`;
  }

  toSnapshot(): MediaAssetProps {
    return { ...this.props };
  }
}
