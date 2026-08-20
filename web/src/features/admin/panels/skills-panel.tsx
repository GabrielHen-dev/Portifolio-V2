// Aba Tecnologias: categorias e skills com CRUD e reordenação.

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { skillCategoriesApi, skillsApi } from '../api/admin.api';
import { Drawer, EmptyState, PanelShell } from '../components/panel-shell';
import { SortableList } from '../components/sortable-list';
import type { Skill, SkillCategoryDto } from '@/features/portfolio/types';
import { useI18n } from '@/shared/i18n/i18n-provider';
import { Button } from '@/shared/ui/button';
import { InputField, SelectField, Toggle } from '@/shared/ui/field';

interface SkillFormState {
  name: string;
  categoryId: string;
  icon: string;
  visible: boolean;
}

interface CategoryFormState {
  namePt: string;
  nameEn: string;
}

const EMPTY_CATEGORY: CategoryFormState = { namePt: '', nameEn: '' };

export function SkillsPanel() {
  const { t, pick } = useI18n();

  const { data: categories = [] } = skillCategoriesApi.useList();
  const createCategory = skillCategoriesApi.useCreate();
  const updateCategory = skillCategoriesApi.useUpdate();
  const removeCategory = skillCategoriesApi.useDelete();
  const reorderCategories = skillCategoriesApi.useReorder();

  const [editingCategory, setEditingCategory] = useState<SkillCategoryDto | null>(null);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(EMPTY_CATEGORY);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [orderedCategories, setOrderedCategories] = useState<SkillCategoryDto[]>(categories);
  useEffect(() => setOrderedCategories(categories), [categories]);

  const openCreateCategory = (): void => {
    setEditingCategory(null);
    setCategoryForm(EMPTY_CATEGORY);
    setCategoryError(null);
    setCategoryDrawerOpen(true);
  };

  const openEditCategory = (category: SkillCategoryDto): void => {
    setEditingCategory(category);
    setCategoryForm({ namePt: category.name.pt, nameEn: category.name.en });
    setCategoryError(null);
    setCategoryDrawerOpen(true);
  };

  const submitCategory = async (): Promise<void> => {
    setCategoryError(null);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryForm });
      } else {
        await createCategory.mutateAsync(categoryForm);
      }
      setCategoryDrawerOpen(false);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  const confirmDeleteCategory = async (category: SkillCategoryDto): Promise<void> => {
    if (!window.confirm(t.admin.actions.confirmDelete)) return;
    setCategoryError(null);
    try {
      await removeCategory.mutateAsync(category.id);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Erro ao excluir.');
    }
  };

  const { data: skills = [], isPending } = skillsApi.useList();
  const create = skillsApi.useCreate();
  const update = skillsApi.useUpdate();
  const remove = skillsApi.useDelete();
  const reorder = skillsApi.useReorder();

  const [editing, setEditing] = useState<Skill | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<SkillFormState>({
    name: '',
    categoryId: '',
    icon: '',
    visible: true,
  });
  const [error, setError] = useState<string | null>(null);

  const [ordered, setOrdered] = useState<Skill[]>(skills);
  useEffect(() => setOrdered(skills), [skills]);

  const categoryNameOf = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? pick(category.name) : 'Sem categoria';
  };

  const openCreate = (): void => {
    setEditing(null);
    setForm({ name: '', categoryId: categories[0]?.id ?? '', icon: '', visible: true });
    setError(null);
    setDrawerOpen(true);
  };

  const openEdit = (skill: Skill): void => {
    setEditing(skill);
    setForm({
      name: skill.name,
      categoryId: skill.categoryId,
      icon: skill.icon ?? '',
      visible: skill.visible,
    });
    setError(null);
    setDrawerOpen(true);
  };

  const submit = async (): Promise<void> => {
    setError(null);
    const payload = { ...form, icon: form.icon.trim() || null };

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

  const handleReorder = (next: Skill[]): void => {
    setOrdered(next);
    reorder.mutate(next.map((item) => item.id));
  };

  const confirmDelete = (skill: Skill): void => {
    if (!window.confirm(t.admin.actions.confirmDelete)) return;
    remove.mutate(skill.id);
  };

  return (
    <PanelShell index={1} title={t.admin.nav.skills} description={t.admin.actions.dragToReorder} onCreate={openCreate}>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-4">
          <h2 className="eyebrow shrink-0">Categorias</h2>
          <span aria-hidden="true" className="h-px flex-1 bg-rule" />
          <Button size="sm" variant="ghost" onClick={openCreateCategory} className="shrink-0">
            <Plus className="size-3.5" aria-hidden="true" />
            Nova categoria
          </Button>
        </div>

        {categoryError && (
          <p role="alert" className="mb-3 border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
            {categoryError}
          </p>
        )}

        {orderedCategories.length === 0 ? (
          <EmptyState message="Crie a primeira categoria para poder cadastrar tecnologias." />
        ) : (
          <SortableList
            items={orderedCategories}
            onReorder={(next) => {
              setOrderedCategories(next);
              reorderCategories.mutate(next.map((item) => item.id));
            }}
            renderItem={(category) => (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{category.name.pt}</p>
                  <p className="eyebrow mt-0.5">{category.name.en}</p>
                </div>

                <button
                  type="button"
                  onClick={() => openEditCategory(category)}
                  aria-label={`${t.admin.actions.edit} ${category.name.pt}`}
                  className="p-2 text-ink-muted transition hover:bg-surface-raised hover:text-ink"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDeleteCategory(category)}
                  aria-label={`${t.admin.actions.delete} ${category.name.pt}`}
                  className="p-2 text-ink-muted transition hover:border-alert/50 hover:text-alert"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          />
        )}
      </section>

      <div className="mb-3 flex items-center gap-4">
        <h2 className="eyebrow shrink-0">{t.admin.nav.skills}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-rule" />
      </div>

      {isPending ? (
        <div className="grid gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse bg-surface-raised" />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <EmptyState />
      ) : (
        <SortableList
          items={ordered}
          onReorder={handleReorder}
          renderItem={(skill) => (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {skill.name}
                  {!skill.visible && <span className="eyebrow ml-2">{t.admin.actions.hidden}</span>}
                </p>
                <p className="eyebrow mt-0.5">{categoryNameOf(skill.categoryId)}</p>
              </div>

              <button
                type="button"
                onClick={() => openEdit(skill)}
                aria-label={`${t.admin.actions.edit} ${skill.name}`}
                className="p-2 text-ink-muted transition hover:bg-surface-raised hover:text-ink"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(skill)}
                aria-label={`${t.admin.actions.delete} ${skill.name}`}
                className="p-2 text-ink-muted transition hover:border-alert/50 hover:text-alert"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        />
      )}

      <Drawer
        open={drawerOpen}
        title={editing ? `${t.admin.actions.edit}: ${editing.name}` : t.admin.actions.create}
        onClose={() => setDrawerOpen(false)}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <InputField
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />

          <SelectField
            label="Categoria"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="" disabled>
              Selecione...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {pick(category.name)}
              </option>
            ))}
          </SelectField>

          <InputField
            label="Sigla"
            hint="Tecnologias conhecidas ganham a logo automaticamente pelo nome. Use este campo para forçar uma logo (ex.: react, postgres) ou como sigla quando não houver logo."
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            maxLength={10}
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

      <Drawer
        open={categoryDrawerOpen}
        title={editingCategory ? `${t.admin.actions.edit}: ${editingCategory.name.pt}` : 'Nova categoria'}
        onClose={() => setCategoryDrawerOpen(false)}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitCategory();
          }}
        >
          <InputField
            label="Nome (PT)"
            value={categoryForm.namePt}
            onChange={(e) => setCategoryForm({ ...categoryForm, namePt: e.target.value })}
            required
            autoFocus
            maxLength={40}
          />
          <InputField
            label="Nome (EN)"
            value={categoryForm.nameEn}
            onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
            required
            maxLength={40}
          />

          {categoryError && (
            <p role="alert" className="border-l-2 border-alert bg-alert/10 px-3 py-2 text-sm text-alert">
              {categoryError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
              {createCategory.isPending || updateCategory.isPending
                ? t.admin.actions.saving
                : t.admin.actions.save}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCategoryDrawerOpen(false)}>
              {t.admin.actions.cancel}
            </Button>
          </div>
        </form>
      </Drawer>
    </PanelShell>
  );
}
