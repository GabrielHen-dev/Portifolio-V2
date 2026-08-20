// Repositório Drizzle das tecnologias.

import { asc, eq, max } from 'drizzle-orm';
import type { Skill } from '../../../domain/portfolio/entities/skill.js';
import type {
  ListOptions,
  ReorderInstruction,
  SkillRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { db } from '../connection.js';
import { PortfolioMapper } from '../mappers/portfolio.mapper.js';
import { skills } from '../schema.js';

export class DrizzleSkillRepository implements SkillRepository {
  async list(options: ListOptions = {}): Promise<Skill[]> {
    const rows = await db
      .select()
      .from(skills)
      .where(options.onlyVisible ? eq(skills.visible, true) : undefined)
      .orderBy(asc(skills.sortOrder), asc(skills.name));
    return rows.map(PortfolioMapper.toSkill);
  }

  async findById(id: string): Promise<Skill | null> {
    const [row] = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
    return row ? PortfolioMapper.toSkill(row) : null;
  }

  async create(skill: Skill): Promise<Skill> {
    const [row] = await db.insert(skills).values(PortfolioMapper.toSkillRow(skill)).returning();
    if (!row) throw new Error('Falha ao criar a tecnologia.');
    return PortfolioMapper.toSkill(row);
  }

  async save(skill: Skill): Promise<void> {
    await db.update(skills).set(PortfolioMapper.toSkillRow(skill)).where(eq(skills.id, skill.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  async reorder(instructions: ReorderInstruction[]): Promise<void> {
    if (instructions.length === 0) return;
    await db.transaction(async (tx) => {
      for (const { id, sortOrder } of instructions) {
        await tx.update(skills).set({ sortOrder }).where(eq(skills.id, id));
      }
    });
  }

  async nextSortOrder(): Promise<number> {
    const [row] = await db.select({ value: max(skills.sortOrder) }).from(skills);
    return (row?.value ?? -1) + 1;
  }
}
