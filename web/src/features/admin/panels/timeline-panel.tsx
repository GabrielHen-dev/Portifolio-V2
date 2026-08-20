// Aba Trajetória: CRUD das experiências e formações.

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { timelineApi } from '../api/admin.api';
import { Drawer, EmptyState, PanelShell } from '../components/panel-shell';
import { SortableList } from '../components/sortable-list';
import type { TimelineEntry, TimelineKind } from '@/features/portfolio/types';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';
import { InputField, SelectField, TextareaField, Toggle } from '@/shared/ui/field';

interface FormState {
  kind: TimelineKind;
  rolePt: string;
  roleEn: string;
  org: string;
  startDate: string;
  endDate: string;
  location: string;
  descriptionPt: string;
  descriptionEn: string;
  visible: boolean;
}

const EMPTY_FORM: FormState = {
  kind: 'experience',
  rolePt: '',
  roleEn: '',
  org: '',
  startDate: '',
  endDate: '',
  location: '',
  descriptionPt: '',
  descriptionEn: '',
  visible: true,
};

export function TimelinePanel() {
  const { t, pick } = useI18n();

  const { data: entries = [], isPending } = timelineApi.useList();
  const create = timelineApi.useCreate();
  const update = timelineApi.useUpdate();
  const remove = timelineApi.useDelete();
  const reorder = timelineApi.useReorder();

  const [editing, setEditing] = useState<TimelineEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const [ordered, setOrdered] = useState<TimelineEntry[]>(entries);
  useEffect(() => setOrdered(entries), [entries]);

  const openCreate = (): void => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDrawerOpen(true);
  };

  const openEdit = (entry: TimelineEntry): void => {
    setEditing(entry);
    setForm({
      kind: entry.kind,
      rolePt: entry.role.pt,
      roleEn: entry.role.en,
      org: entry.org,
      startDate: entry.startDate,
      endDate: entry.endDate ?? '',
      location: entry.location ?? '',
      descriptionPt: entry.description.pt,
      descriptionEn: entry.description.en,
      visible: entry.visible,
    });
    setError(null);
    setDrawerOpen(true);
  };

  const submit = async (): Promise<void> => {
    setError(null);

    const payload = {
      ...form,
      endDate: form.endDate.trim() || null,
      location: form.location.trim() || null,
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      setDrawerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  const handleReorder = (next: TimelineEntry[]): void => {
    setOrdered(next);
    reorder.mutate(next.map((item) => item.id));
  };

  const confirmDelete = (entry: TimelineEntry): void => {
    if (!window.confirm(t.admin.actions.confirmDelete)) return;
    remove.mutate(entry.id);
  };

  return (
    <PanelShell index={3} title={t.admin.nav.timeline} description={t.admin.actions.dragToReorder} onCreate={openCreate}>
      {isPending ? (
        <div className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <EmptyState />
      ) : (
        <SortableList
          items={ordered}
          onReorder={handleReorder}
          renderItem={(entry) => (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {pick(entry.role)}
                  {!entry.visible && (
                    <span className="eyebrow ml-2">
                      {t.admin.actions.hidden}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {entry.org} · {entry.endDate ? `${entry.startDate} ${t.experience.rangeTo} ${entry.endDate}` : `${t.experience.since} ${entry.startDate}`}
                </p>
              </div>

              <span className="eyebrow hidden sm:inline">
                {entry.kind === 'education' ? t.experience.education : t.experience.experience}
              </span>

              <button
                type="button"
                onClick={() => openEdit(entry)}
                aria-label={`${t.admin.actions.edit} ${pick(entry.role)}`}
                className="p-2 text-ink-muted transition hover:bg-surface-raised hover:text-ink"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(entry)}
                aria-label={`${t.admin.actions.delete} ${pick(entry.role)}`}
                className="p-2 text-ink-muted transition hover:bg-alert/10 hover:text-alert"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        />
      )}

      <Drawer
        open={drawerOpen}
        title={editing ? `${t.admin.actions.edit}: ${pick(editing.role)}` : t.admin.actions.create}
        onClose={() => setDrawerOpen(false)}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <SelectField
            label="Tipo"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as TimelineKind })}
          >
            <option value="experience">{t.experience.experience}</option>
            <option value="education">{t.experience.education}</option>
          </SelectField>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Cargo (PT)"
              value={form.rolePt}
              onChange={(e) => setForm({ ...form, rolePt: e.target.value })}
              required
              autoFocus
            />
            <InputField
              label="Cargo (EN)"
              value={form.roleEn}
              onChange={(e) => setForm({ ...form, roleEn: e.target.value })}
              required
            />
          </div>

          <InputField
            label="Organização"
            value={form.org}
            onChange={(e) => setForm({ ...form, org: e.target.value })}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Início"
              placeholder="08/2025"
              pattern="(0[1-9]|1[0-2])/\d{4}"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <InputField
              label="Fim"
              hint="Vazio = atual"
              placeholder="12/2025"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <InputField
            label="Local"
            placeholder="Recife - PE, Brasil"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <TextareaField
            label="Descrição (PT)"
            value={form.descriptionPt}
            onChange={(e) => setForm({ ...form, descriptionPt: e.target.value })}
          />
          <TextareaField
            label="Descrição (EN)"
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
          />

          <Toggle
            checked={form.visible}
            onChange={(visible) => setForm({ ...form, visible })}
            label={t.admin.actions.visible}
          />

          {error && (
            <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? t.admin.actions.saving : t.admin.actions.save}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>
              {t.admin.actions.cancel}
            </Button>
          </div>
        </form>
      </Drawer>
    </PanelShell>
  );
}
