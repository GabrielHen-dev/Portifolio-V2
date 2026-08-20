// Aba Textos: campos PT/EN e foto de perfil com upload direto.

import { Check, ImageOff, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useContent, useMedia, useSaveContent, useUploadMedia } from '../api/admin.api';
import { PanelShell } from '../components/panel-shell';
import type { SiteContent } from '@/features/portfolio/types';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';
import { InputField, SelectField, TextareaField } from '@/shared/ui/field';

const GROUPS: Array<{
  title: string;
  fields: Array<{ key: string; label: string; multiline?: boolean; media?: boolean }>;
}> = [
  {
    title: 'Hero',
    fields: [
      { key: 'hero.headline', label: 'Título principal' },
      { key: 'hero.subheadline', label: 'Subtítulo', multiline: true },
      { key: 'hero.cta', label: 'Texto do botão' },
    ],
  },
  {
    title: 'Sobre',
    fields: [
      { key: 'about.title', label: 'Título da seção' },
      { key: 'about.photo', label: 'Foto de perfil', media: true },
      { key: 'about.body', label: 'Texto', multiline: true },
      { key: 'about.profile', label: 'Destaque do perfil', multiline: true },
    ],
  },
  {
    title: 'Contato',
    fields: [
      { key: 'contact.title', label: 'Título da seção' },
      { key: 'contact.body', label: 'Texto', multiline: true },
      { key: 'contact.email', label: 'E-mail' },
      { key: 'contact.phone', label: 'Telefone / WhatsApp' },
      { key: 'contact.github', label: 'GitHub (URL)' },
      { key: 'contact.linkedin', label: 'LinkedIn (URL)' },
      { key: 'contact.location', label: 'Localização' },
    ],
  },
  {
    title: 'Rodapé',
    fields: [{ key: 'footer.note', label: 'Nota' }],
  },
];

const EMPTY = { pt: '', en: '' };

function PhotoField({
  label,
  value,
  onSelect,
}: {
  label: string;
  value: string;
  onSelect: (url: string) => void;
}) {
  const { data: media = [] } = useMedia();
  const upload = useUploadMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const imagens = media.filter((asset) => asset.mime.startsWith('image/'));

  const handleFile = async (files: FileList | null): Promise<void> => {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    try {
      const asset = await upload.mutateAsync(file);

      onSelect(asset.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.');
    }
  };

  return (
    <div className="flex flex-wrap items-start gap-5">

      {value ? (
        <img
          src={value}
          alt="Prévia da foto selecionada"
          className="size-24 shrink-0 border border-rule object-cover"
        />
      ) : (
        <div className="grid size-24 shrink-0 place-items-center border border-dashed border-rule text-ink-muted">
          <ImageOff className="size-5" aria-hidden="true" />
        </div>
      )}

      <div className="grid min-w-56 flex-1 gap-3">
        <SelectField
          label={label}
          hint="Envie uma imagem nova ou reaproveite uma já enviada."
          value={value}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Nenhuma</option>
          {imagens.map((asset) => (
            <option key={asset.id} value={asset.url}>
              {asset.originalName}
            </option>
          ))}
        </SelectField>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files)}
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" aria-hidden="true" />
            {upload.isPending ? 'Enviando...' : 'Enviar nova foto'}
          </Button>

          {value && (
            <Button type="button" variant="link" size="sm" onClick={() => onSelect('')}>
              Remover foto
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function ContentPanel() {
  const { t } = useI18n();
  const { data, isPending } = useContent();
  const save = useSaveContent();

  const [draft, setDraft] = useState<SiteContent>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const setValue = (key: string, locale: 'pt' | 'en', value: string): void => {
    setDraft((current) => ({
      ...current,
      [key]: { ...(current[key] ?? EMPTY), [locale]: value },
    }));
    setSaved(false);
  };

  const submit = async (): Promise<void> => {
    setError(null);

    const known = new Set(GROUPS.flatMap((group) => group.fields.map((field) => field.key)));
    const payload: SiteContent = {};

    for (const [key, value] of Object.entries(draft)) {
      if (known.has(key)) payload[key] = { pt: value.pt ?? '', en: value.en ?? '' };
    }

    try {
      await save.mutateAsync(payload);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  if (isPending) {
    return (
      <PanelShell index={4} title={t.admin.nav.content}>
        <div className="grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-surface-raised" />
          ))}
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell index={4} title={t.admin.nav.content} description="Cada campo tem versão em português e em inglês.">
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {GROUPS.map((group) => (
          <section key={group.title} className="border border-rule p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">{group.title}</h2>

            <div className="grid gap-4">
              {group.fields.map((field) => {
                const value = draft[field.key] ?? EMPTY;

                if (field.media) {
                  return (
                    <PhotoField
                      key={field.key}
                      label={field.label}
                      value={value.pt}
                      onSelect={(url) => {
                        setDraft((current) => ({ ...current, [field.key]: { pt: url, en: url } }));
                        setSaved(false);
                      }}
                    />
                  );
                }

                const Control = field.multiline ? TextareaField : InputField;

                return (
                  <div key={field.key} className="grid gap-3 sm:grid-cols-2">
                    <Control
                      label={`${field.label} (PT)`}
                      value={value.pt}
                      onChange={(e) => setValue(field.key, 'pt', e.target.value)}
                    />
                    <Control
                      label={`${field.label} (EN)`}
                      value={value.en}
                      onChange={(e) => setValue(field.key, 'en', e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {error && (
          <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
            {error}
          </p>
        )}

        <div className="sticky bottom-4 flex items-center gap-4 border border-rule bg-canvas/95 p-3 backdrop-blur">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? t.admin.actions.saving : t.admin.actions.save}
          </Button>

          {saved && (
            <span role="status" className="inline-flex items-center gap-1.5 text-sm text-ok">
              <Check className="size-4" aria-hidden="true" />
              {t.admin.actions.saved}
            </span>
          )}
        </div>
      </form>
    </PanelShell>
  );
}
