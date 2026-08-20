// CRUD e reordenação de tecnologias; confere existência da categoria.

import { randomUUID } from 'node:crypto';
import { Skill } from '../../../domain/portfolio/entities/skill.js';
import type {
  ReorderInstruction,
  SkillCategoryRepository,
  SkillRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { NotFoundError, ValidationError } from '../../../shared/errors/index.js';

export interface CreateSkillInput {
  name: string;
  categoryId: string;
  icon?: string | null;
  level?: number;
  visible?: boolean;
}

export type UpdateSkillInput = Partial<CreateSkillInput>;

export class SkillService {
  constructor(
    private readonly repository: SkillRepository,
    private readonly categories: SkillCategoryRepository,
  ) {}

  list(onlyVisible = false): Promise<Skill[]> {
    return this.repository.list({ onlyVisible });
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categories.findById(categoryId);
    if (!category) {
      throw new ValidationError('A categoria escolhida nao existe mais.', 'categoryId');
    }
  }

  async create(input: CreateSkillInput): Promise<Skill> {
    await this.assertCategoryExists(input.categoryId);

    const skill = Skill.create({
      id: randomUUID(),
      name: input.name,
      categoryId: input.categoryId,
      icon: input.icon ?? null,
      level: input.level ?? 3,
      sortOrder: await this.repository.nextSortOrder(),
      visible: input.visible ?? true,
    });

    return this.repository.create(skill);
  }

  async update(id: string, input: UpdateSkillInput): Promise<Skill> {
    const skill = await this.repository.findById(id);
    if (!skill) throw new NotFoundError('Tecnologia', id);

    if (input.categoryId !== undefined) {
      await this.assertCategoryExists(input.categoryId);
    }

    skill.update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.level !== undefined && { level: input.level }),
      ...(input.visible !== undefined && { visible: input.visible }),
    });

    await this.repository.save(skill);
    return skill;
  }

  async delete(id: string): Promise<void> {
    const skill = await this.repository.findById(id);
    if (!skill) throw new NotFoundError('Tecnologia', id);
    await this.repository.delete(id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const instructions: ReorderInstruction[] = orderedIds.map((id, index) => ({ id, sortOrder: index }));
    await this.repository.reorder(instructions);
  }
}
