// Aba Projetos: CRUD com capa, links e vínculos de skills.

import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { projectsApi, skillsApi, useMedia } from '../api/admin.api';
import { Drawer, EmptyState, PanelShell } from '../components/panel-shell';
import { SortableList } from '../components/sortable-list';
import type { Project } from '@/features/portfolio/types';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';
import { InputField, SelectField, TextareaField, Toggle } from '@/shared/ui/field';
import { cn } from '@/shared/lib/cn';

interface FormState {
  slug: string;
  titlePt: string;
  titleEn: string;
  descriptionPt: string;
  descriptionEn: string;
  repoUrl: string;
  demoUrl: string;
  coverMediaId: string;
  featured: boolean;
  visible: boolean;
  skillIds: string[];
}

const EMPTY_FORM: FormState = {
  slug: '',
  titlePt: '',
  titleEn: '',
  descriptionPt: '',
  descriptionEn: '',
  repoUrl: '',
  demoUrl: '',
  coverMediaId: '',
  featured: false,
  visible: true,
  skillIds: [],
};

export function ProjectsPanel() {
  const { t, pick } = useI18n();

  const { data: projects = [], isPending } = projectsApi.useList();
  const { data: skills = [] } = skillsApi.useList();
  const { data: media = [] } = useMedia();

  const create = projectsApi.useCreate();
  const update = projectsApi.useUpdate();
  const remove = projectsApi.useDelete();
  const reorder = projectsApi.useReorder();

  const [editing, setEditing] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const [ordered, setOrdered] = useState<Project[]>(projects);
  useEffect(() => setOrdered(projects), [projects]);

  const openCreate = (): void => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDrawerOpen(true);
  };

  const openEdit = (project: Project): void => {
    setEditing(project);
    setForm({
      slug: project.slug,
      titlePt: project.title.pt,
      titleEn: project.title.en,
      descriptionPt: project.description.pt,
      descriptionEn: project.description.en,
      repoUrl: project.repoUrl ?? '',
      demoUrl: project.demoUrl ?? '',
      coverMediaId: project.coverMediaId ?? '',
      featured: project.featured,
      visible: project.visible,
      skillIds: project.skillIds,
    });
    setError(null);
    setDrawerOpen(true);
  };

  const toggleSkill = (id: string): void => {
    setForm((current) => ({
      ...current,
      skillIds: current.skillIds.includes(id)
        ? current.skillIds.filter((item) => item !== id)
        : [...current.skillIds, id],
    }));
  };

  const submit = async (): Promise<void> => {
    setError(null);

    const payload = {
      ...form,
      slug: form.slug.trim() || undefined,
      repoUrl: form.repoUrl.trim() || null,
      demoUrl: form.demoUrl.trim() || null,
      coverMediaId: form.coverMediaId || null,
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

  const handleReorder = (next: Project[]): void => {
    setOrdered(next);
    reorder.mutate(next.map((item) => item.id));
  };

  const confirmDelete = (project: Project): void => {
    if (!window.confirm(t.admin.actions.confirmDelete)) return;
    remove.mutate(project.id);
  };

  return (
    <PanelShell index={2} title={t.admin.nav.projects} description={t.admin.actions.dragToReorder} onCreate={openCreate}>
      {isPending ? (
        <div className="grid gap-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <EmptyState />
      ) : (
        <SortableList
          items={ordered}
          onReorder={handleReorder}
          renderItem={(project) => (
            <div className="flex items-center gap-3">
              {project.coverUrl && (
                <img src={project.coverUrl} alt="" className="size-10 shrink-0 object-cover" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {pick(project.title)}
                  {project.featured && (
                    <span className="eyebrow ml-2 !text-gold">
                      {t.projects.featured}
                    </span>
                  )}
                  {!project.visible && (
                    <span className="eyebrow ml-2">
                      {t.admin.actions.hidden}
                    </span>
                  )}
                </p>
                <p className="truncate font-mono text-xs text-ink-muted">{project.slug}</p>
              </div>

              <button
                type="button"
                onClick={() => openEdit(project)}
                aria-label={`${t.admin.actions.edit} ${pick(project.title)}`}
                className="p-2 text-ink-muted transition hover:bg-surface-raised hover:text-ink"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(project)}
                aria-label={`${t.admin.actions.delete} ${pick(project.title)}`}
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
        title={editing ? `${t.admin.actions.edit}: ${pick(editing.title)}` : t.admin.actions.create}
        onClose={() => setDrawerOpen(false)}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Título (PT)"
              value={form.titlePt}
              onChange={(e) => setForm({ ...form, titlePt: e.target.value })}
              required
              autoFocus
            />
            <InputField
              label="Título (EN)"
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              required
            />
          </div>

          <InputField
            label="Identificador"
            hint="Deixe vazio para gerar a partir do título."
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
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

          <InputField
            label="Repositório"
            type="url"
            placeholder="https://github.com/..."
            value={form.repoUrl}
            onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
          />
          <InputField
            label="Demo"
            type="url"
            placeholder="https://..."
            value={form.demoUrl}
            onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
          />

          <SelectField
            label="Imagem de capa"
            value={form.coverMediaId}
            onChange={(e) => setForm({ ...form, coverMediaId: e.target.value })}
          >
            <option value="">Nenhuma</option>
            {media
              .filter((asset) => asset.mime.startsWith('image/'))
              .map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.originalName}
                </option>
              ))}
          </SelectField>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">{t.admin.nav.skills}</legend>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => {
                const selected = form.skillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-[3px] border px-3 py-1.5 text-sm transition',
                      selected
                        ? 'border-transparent bg-accent text-accent-ink'
                        : 'border-border-subtle text-ink-muted hover:bg-surface-raised',
                    )}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-5">
            <Toggle
              checked={form.featured}
              onChange={(featured) => setForm({ ...form, featured })}
              label={t.projects.featured}
            />
            <Toggle
              checked={form.visible}
              onChange={(visible) => setForm({ ...form, visible })}
              label={t.admin.actions.visible}
            />
          </div>

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
