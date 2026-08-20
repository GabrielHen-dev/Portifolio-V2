// CRUD de categorias; exclusão barrada quando há tecnologias vinculadas.

import { randomUUID } from 'node:crypto';
import { SkillCategory } from '../../../domain/portfolio/entities/skill-category.js';
import type {
  ReorderInstruction,
  SkillCategoryRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { LocalizedText } from '../../../domain/portfolio/value-objects/localized-text.js';
import { ConflictError, NotFoundError } from '../../../shared/errors/index.js';

export interface CategoryPayload {
  namePt: string;
  nameEn: string;
}

export class SkillCategoryService {
  constructor(private readonly repository: SkillCategoryRepository) {}

  list(): Promise<SkillCategory[]> {
    return this.repository.list();
  }

  async create(input: CategoryPayload): Promise<SkillCategory> {
    const category = SkillCategory.create({
      id: randomUUID(),
      name: LocalizedText.create(input.namePt, input.nameEn, 'nome', { max: 40 }),
      sortOrder: await this.repository.nextSortOrder(),
    });

    return this.repository.create(category);
  }

  async update(id: string, input: Partial<CategoryPayload>): Promise<SkillCategory> {
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundError('Categoria', id);

    if (input.namePt !== undefined || input.nameEn !== undefined) {
      category.update({
        name: LocalizedText.create(
          input.namePt ?? category.name.pt,
          input.nameEn ?? category.name.en,
          'nome',
          { max: 40 },
        ),
      });
    }

    await this.repository.save(category);
    return category;
  }

  async delete(id: string): Promise<void> {
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundError('Categoria', id);

    const inUse = await this.repository.countSkills(id);
    if (inUse > 0) {
      throw new ConflictError(
        `A categoria "${category.name.pt}" tem ${inUse} tecnologia(s). Mova ou exclua elas antes.`,
      );
    }

    await this.repository.delete(id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const instructions: ReorderInstruction[] = orderedIds.map((id, index) => ({ id, sortOrder: index }));
    await this.repository.reorder(instructions);
  }
}
