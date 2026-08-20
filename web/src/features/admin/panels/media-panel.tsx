// Aba Arquivos: upload com arrastar-e-soltar e grade de mídia.

import { FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDeleteMedia, useMedia, useUploadMedia } from '../api/admin.api';
import { EmptyState, PanelShell } from '../components/panel-shell';
import type { MediaAsset } from '@/features/portfolio/types';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';

const MAX_BYTES = 5 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaPanel() {
  const { t } = useI18n();

  const { data: assets = [], isPending } = useMedia();
  const upload = useUploadMedia();
  const remove = useDeleteMedia();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null): Promise<void> => {
    setError(null);
    const file = files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError(`Arquivo acima do limite de ${MAX_BYTES / 1024 / 1024} MB.`);
      return;
    }

    try {
      await upload.mutateAsync(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.');
    }
  };

  const confirmDelete = (asset: MediaAsset): void => {
    if (!window.confirm(t.admin.actions.confirmDelete)) return;
    remove.mutate(asset.id);
  };

  return (
    <PanelShell index={5} title={t.admin.nav.media} description="PNG, JPEG, WebP, AVIF ou PDF. Até 5 MB.">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'mb-6 grid place-items-center gap-3 border border-dashed p-10 text-center transition',
          dragging ? 'border-accent bg-accent-soft/40' : 'border-border-subtle',
        )}
      >
        <Upload className="size-6 text-ink-muted" aria-hidden="true" />
        <p className="text-sm text-ink-muted">Arraste um arquivo aqui ou</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
        />

        <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          {upload.isPending ? t.admin.actions.saving : 'Escolher arquivo'}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mb-4 border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
          {error}
        </p>
      )}

      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="aspect-square animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <li key={asset.id} className="group relative overflow-hidden border border-rule">
              {asset.mime.startsWith('image/') ? (
                <img
                  src={asset.url}
                  alt={asset.originalName}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="grid aspect-square place-items-center bg-surface-raised">
                  <FileText className="size-8 text-ink-muted" aria-hidden="true" />
                </div>
              )}

              <div className="p-2.5">
                <p className="truncate text-xs font-medium">{asset.originalName}</p>
                <p className="text-xs text-ink-muted">{formatSize(asset.size)}</p>
              </div>

              <button
                type="button"
                onClick={() => confirmDelete(asset)}
                aria-label={`${t.admin.actions.delete} ${asset.originalName}`}
                className={cn(
                  'absolute right-2 top-2 rounded-full bg-surface/90 p-1.5 text-ink-muted backdrop-blur transition',
                  'hover:bg-alert hover:text-white',

                  'opacity-0 focus-visible:opacity-100 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100',
                )}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
