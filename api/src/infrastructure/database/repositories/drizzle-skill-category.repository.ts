// Repositório Drizzle das categorias de tecnologia.

import { asc, count, eq, max } from 'drizzle-orm';
import type { SkillCategory } from '../../../domain/portfolio/entities/skill-category.js';
import type {
  ReorderInstruction,
  SkillCategoryRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { db } from '../connection.js';
import { PortfolioMapper } from '../mappers/portfolio.mapper.js';
import { skillCategories, skills } from '../schema.js';

export class DrizzleSkillCategoryRepository implements SkillCategoryRepository {
  async list(): Promise<SkillCategory[]> {
    const rows = await db
      .select()
      .from(skillCategories)
      .orderBy(asc(skillCategories.sortOrder), asc(skillCategories.namePt));
    return rows.map(PortfolioMapper.toSkillCategory);
  }

  async findById(id: string): Promise<SkillCategory | null> {
    const [row] = await db.select().from(skillCategories).where(eq(skillCategories.id, id)).limit(1);
    return row ? PortfolioMapper.toSkillCategory(row) : null;
  }

  async create(category: SkillCategory): Promise<SkillCategory> {
    const [row] = await db
      .insert(skillCategories)
      .values(PortfolioMapper.toSkillCategoryRow(category))
      .returning();
    if (!row) throw new Error('Falha ao criar a categoria.');
    return PortfolioMapper.toSkillCategory(row);
  }

  async save(category: SkillCategory): Promise<void> {
    await db
      .update(skillCategories)
      .set(PortfolioMapper.toSkillCategoryRow(category))
      .where(eq(skillCategories.id, category.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
  }

  async reorder(instructions: ReorderInstruction[]): Promise<void> {
    if (instructions.length === 0) return;
    await db.transaction(async (tx) => {
      for (const { id, sortOrder } of instructions) {
        await tx.update(skillCategories).set({ sortOrder }).where(eq(skillCategories.id, id));
      }
    });
  }

  async nextSortOrder(): Promise<number> {
    const [row] = await db.select({ value: max(skillCategories.sortOrder) }).from(skillCategories);
    return (row?.value ?? -1) + 1;
  }

  async countSkills(categoryId: string): Promise<number> {
    const [row] = await db.select({ value: count() }).from(skills).where(eq(skills.categoryId, categoryId));
    return row?.value ?? 0;
  }
}
