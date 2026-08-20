// Aba Aparência: paletas, cor personalizada e tema inicial, com prévia ao vivo.

import { AlertTriangle, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSaveThemeSettings, useThemeSettings } from '../api/admin.api';
import { PanelShell } from '../components/panel-shell';
import type { DefaultMode, ThemeResponse } from '@/features/portfolio/types';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { PALETTES, readableInkFor, type PaletteId } from '@/shared/theme/palettes';
import { useTheme } from '@/shared/theme/theme-provider';
import { Button } from '@/shared/ui/button';
import { InputField, SelectField } from '@/shared/ui/field';
import { cn } from '@/shared/lib/cn';

const HEX = /^#[0-9a-f]{6}$/i;

export function AppearancePanel() {
  const { t, locale } = useI18n();
  const { theme, applySettings } = useTheme();

  const { data, isPending } = useThemeSettings();
  const save = useSaveThemeSettings();

  const [draft, setDraft] = useState<ThemeResponse | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  useEffect(() => {
    if (!draft) return;
    applySettings({ palette: draft.palette, customAccent: draft.customAccent });

    return () => {
      if (data) applySettings({ palette: data.palette, customAccent: data.customAccent });
    };
  }, [draft, data, applySettings]);

  if (isPending || !draft) {
    return (
      <PanelShell index={6} title={t.admin.nav.appearance}>
        <div className="h-40 animate-pulse bg-surface-raised" />
      </PanelShell>
    );
  }

  const customIsValid = !draft.customAccent || HEX.test(draft.customAccent);
  const dirty = Boolean(data) && JSON.stringify(draft) !== JSON.stringify(data);

  const contrastRisky =
    Boolean(draft.customAccent) && customIsValid && readableInkFor(draft.customAccent!) === '#0a0a0a';

  const submit = async (): Promise<void> => {
    setError(null);
    try {
      await save.mutateAsync({
        palette: draft.palette,
        customAccent: draft.customAccent || null,
        defaultMode: draft.defaultMode,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  return (
    <PanelShell index={6} title={t.admin.nav.appearance} description={t.admin.appearance.description}>
      <form
        className="grid max-w-2xl gap-10"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >

        <fieldset>
          <legend className="eyebrow mb-4">{t.admin.appearance.palette}</legend>

          <div className="grid grid-cols-2 gap-px bg-rule sm:grid-cols-3">
            {PALETTES.map((palette) => {
              const selected = !draft.customAccent && draft.palette === palette.id;
              const swatch = theme === 'dark' ? palette.swatch.dark : palette.swatch.light;

              return (
                <button
                  key={palette.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setDraft({ ...draft, palette: palette.id as PaletteId, customAccent: null })
                  }
                  className={cn(
                    'flex items-center gap-3 bg-canvas p-4 text-left transition-colors',
                    selected ? 'bg-surface-raised' : 'hover:bg-surface-raised',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="size-6 shrink-0 rounded-full"
                    style={{ backgroundColor: swatch }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{palette.label[locale]}</span>
                  {selected && <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3">
          <InputField
            label={t.admin.appearance.customAccent}
            hint={t.admin.appearance.customAccentHint}
            value={draft.customAccent ?? ''}
            onChange={(e) => setDraft({ ...draft, customAccent: e.target.value || null })}
            placeholder="#4f46e5"
            maxLength={7}
            {...(!customIsValid && { error: 'Use o formato #RRGGBB.' })}
          />

          <div className="flex flex-wrap items-center gap-3">

            <input
              type="color"
              aria-label={t.admin.appearance.customAccent}
              value={customIsValid && draft.customAccent ? draft.customAccent : '#4f46e5'}
              onChange={(e) => setDraft({ ...draft, customAccent: e.target.value })}
              className="h-9 w-14 cursor-pointer border border-rule bg-surface p-1"
            />

            {draft.customAccent && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setDraft({ ...draft, customAccent: null })}
              >
                {t.admin.appearance.clearCustom}
              </Button>
            )}
          </div>

          {contrastRisky && (
            <p className="flex items-center gap-2 text-xs text-warning">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
              {t.admin.appearance.contrastWarning}
            </p>
          )}
        </div>

        <SelectField
          label={t.admin.appearance.defaultMode}
          value={draft.defaultMode}
          onChange={(e) => setDraft({ ...draft, defaultMode: e.target.value as DefaultMode })}
        >
          <option value="system">{t.admin.appearance.modes.system}</option>
          <option value="light">{t.admin.appearance.modes.light}</option>
          <option value="dark">{t.admin.appearance.modes.dark}</option>
        </SelectField>

        {error && (
          <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 border-t border-rule pt-5">
          <Button type="submit" disabled={save.isPending || !customIsValid || !dirty}>
            {save.isPending ? t.admin.actions.saving : t.admin.actions.save}
          </Button>

          {dirty && !saved && <span className="eyebrow">{t.admin.appearance.previewNotice}</span>}

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
