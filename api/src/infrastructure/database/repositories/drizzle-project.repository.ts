// Repositório Drizzle dos projetos (vínculos de skills sem N+1).

import { asc, eq, inArray, max } from 'drizzle-orm';
import type { Project } from '../../../domain/portfolio/entities/project.js';
import type {
  ListOptions,
  ProjectRepository,
  ReorderInstruction,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { db } from '../connection.js';
import { PortfolioMapper } from '../mappers/portfolio.mapper.js';
import { projectSkills, projects } from '../schema.js';

export class DrizzleProjectRepository implements ProjectRepository {
  private async loadSkillIds(projectIds: string[]): Promise<Map<string, string[]>> {
    const grouped = new Map<string, string[]>();
    if (projectIds.length === 0) return grouped;

    const links = await db.select().from(projectSkills).where(inArray(projectSkills.projectId, projectIds));
    for (const link of links) {
      const current = grouped.get(link.projectId) ?? [];
      current.push(link.skillId);
      grouped.set(link.projectId, current);
    }
    return grouped;
  }

  async list(options: ListOptions = {}): Promise<Project[]> {
    const rows = await db
      .select()
      .from(projects)
      .where(options.onlyVisible ? eq(projects.visible, true) : undefined)
      .orderBy(asc(projects.sortOrder), asc(projects.titlePt));

    const skillMap = await this.loadSkillIds(rows.map((r) => r.id));
    return rows.map((row) => PortfolioMapper.toProject(row, skillMap.get(row.id) ?? []));
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!row) return null;
    const skillMap = await this.loadSkillIds([row.id]);
    return PortfolioMapper.toProject(row, skillMap.get(row.id) ?? []);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (!row) return null;
    const skillMap = await this.loadSkillIds([row.id]);
    return PortfolioMapper.toProject(row, skillMap.get(row.id) ?? []);
  }

  async create(project: Project): Promise<Project> {
    return db.transaction(async (tx) => {
      const [row] = await tx.insert(projects).values(PortfolioMapper.toProjectRow(project)).returning();
      if (!row) throw new Error('Falha ao criar o projeto.');

      const skillIds = project.skillIds;
      if (skillIds.length > 0) {
        await tx.insert(projectSkills).values(skillIds.map((skillId) => ({ projectId: row.id, skillId })));
      }
      return PortfolioMapper.toProject(row, skillIds);
    });
  }

  async save(project: Project): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.update(projects).set(PortfolioMapper.toProjectRow(project)).where(eq(projects.id, project.id));

      await tx.delete(projectSkills).where(eq(projectSkills.projectId, project.id));
      const skillIds = project.skillIds;
      if (skillIds.length > 0) {
        await tx.insert(projectSkills).values(skillIds.map((skillId) => ({ projectId: project.id, skillId })));
      }
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async reorder(instructions: ReorderInstruction[]): Promise<void> {
    if (instructions.length === 0) return;
    await db.transaction(async (tx) => {
      for (const { id, sortOrder } of instructions) {
        await tx.update(projects).set({ sortOrder }).where(eq(projects.id, id));
      }
    });
  }

  async nextSortOrder(): Promise<number> {
    const [row] = await db.select({ value: max(projects.sortOrder) }).from(projects);
    return (row?.value ?? -1) + 1;
  }
}
