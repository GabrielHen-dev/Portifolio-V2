// CRUD de projetos: slug único, vínculos de skills e reordenação.

import { randomUUID } from 'node:crypto';
import { Project } from '../../../domain/portfolio/entities/project.js';
import type {
  ProjectRepository,
  ReorderInstruction,
  SkillRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { LocalizedText } from '../../../domain/portfolio/value-objects/localized-text.js';
import { Slug } from '../../../domain/portfolio/value-objects/slug.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../shared/errors/index.js';

export interface ProjectPayload {
  slug?: string;
  titlePt: string;
  titleEn: string;
  descriptionPt: string;
  descriptionEn: string;
  repoUrl?: string | null;
  demoUrl?: string | null;
  coverMediaId?: string | null;
  featured?: boolean;
  visible?: boolean;
  skillIds?: string[];
}

export class ProjectService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly skills: SkillRepository,
  ) {}

  list(onlyVisible = false): Promise<Project[]> {
    return this.repository.list({ onlyVisible });
  }

  async create(input: ProjectPayload): Promise<Project> {
    const slug = Slug.create(input.slug?.trim() || input.titlePt);
    await this.assertSlugAvailable(slug, null);
    await this.assertSkillsExist(input.skillIds ?? []);

    const project = Project.create({
      id: randomUUID(),
      slug,
      title: LocalizedText.create(input.titlePt, input.titleEn, 'titulo'),
      description: LocalizedText.create(input.descriptionPt, input.descriptionEn, 'descricao', {
        required: false,
      }),
      repoUrl: input.repoUrl ?? null,
      demoUrl: input.demoUrl ?? null,
      coverMediaId: input.coverMediaId ?? null,
      featured: input.featured ?? false,
      sortOrder: await this.repository.nextSortOrder(),
      visible: input.visible ?? true,
      skillIds: input.skillIds ?? [],
    });

    return this.repository.create(project);
  }

  async update(id: string, input: Partial<ProjectPayload>): Promise<Project> {
    const project = await this.repository.findById(id);
    if (!project) throw new NotFoundError('Projeto', id);

    if (input.slug !== undefined) {
      const slug = Slug.create(input.slug);
      await this.assertSlugAvailable(slug, id);
      project.update({ slug });
    }

    if (input.skillIds !== undefined) {
      await this.assertSkillsExist(input.skillIds);
      project.update({ skillIds: input.skillIds });
    }

    if (input.titlePt !== undefined || input.titleEn !== undefined) {
      project.update({
        title: LocalizedText.create(input.titlePt ?? project.title.pt, input.titleEn ?? project.title.en, 'titulo'),
      });
    }

    if (input.descriptionPt !== undefined || input.descriptionEn !== undefined) {
      project.update({
        description: LocalizedText.create(
          input.descriptionPt ?? project.description.pt,
          input.descriptionEn ?? project.description.en,
          'descricao',
          { required: false },
        ),
      });
    }

    project.update({
      ...(input.repoUrl !== undefined && { repoUrl: input.repoUrl }),
      ...(input.demoUrl !== undefined && { demoUrl: input.demoUrl }),
      ...(input.coverMediaId !== undefined && { coverMediaId: input.coverMediaId }),
      ...(input.featured !== undefined && { featured: input.featured }),
      ...(input.visible !== undefined && { visible: input.visible }),
    });

    await this.repository.save(project);
    return project;
  }

  async delete(id: string): Promise<void> {
    const project = await this.repository.findById(id);
    if (!project) throw new NotFoundError('Projeto', id);
    await this.repository.delete(id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const instructions: ReorderInstruction[] = orderedIds.map((id, index) => ({ id, sortOrder: index }));
    await this.repository.reorder(instructions);
  }

  private async assertSlugAvailable(slug: Slug, ignoreId: string | null): Promise<void> {
    const existing = await this.repository.findBySlug(slug.value);
    if (existing && existing.id !== ignoreId) {
      throw new ConflictError(`Ja existe um projeto com o identificador "${slug.value}".`);
    }
  }

  private async assertSkillsExist(skillIds: string[]): Promise<void> {
    if (skillIds.length === 0) return;

    const known = new Set((await this.skills.list()).map((s) => s.id));
    const unknown = skillIds.filter((id) => !known.has(id));

    if (unknown.length > 0) {
      throw new ValidationError('Uma ou mais tecnologias selecionadas nao existem mais.', 'skillIds');
    }
  }
}
