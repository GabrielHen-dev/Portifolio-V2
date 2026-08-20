// Repositório Drizzle da trajetória.

import { asc, eq, max } from 'drizzle-orm';
import type { TimelineEntry } from '../../../domain/portfolio/entities/timeline-entry.js';
import type {
  ListOptions,
  ReorderInstruction,
  TimelineRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { db } from '../connection.js';
import { PortfolioMapper } from '../mappers/portfolio.mapper.js';
import { timelineEntries } from '../schema.js';

export class DrizzleTimelineRepository implements TimelineRepository {
  async list(options: ListOptions = {}): Promise<TimelineEntry[]> {
    const rows = await db
      .select()
      .from(timelineEntries)
      .where(options.onlyVisible ? eq(timelineEntries.visible, true) : undefined)
      .orderBy(asc(timelineEntries.sortOrder));
    return rows.map(PortfolioMapper.toTimelineEntry);
  }

  async findById(id: string): Promise<TimelineEntry | null> {
    const [row] = await db.select().from(timelineEntries).where(eq(timelineEntries.id, id)).limit(1);
    return row ? PortfolioMapper.toTimelineEntry(row) : null;
  }

  async create(entry: TimelineEntry): Promise<TimelineEntry> {
    const [row] = await db.insert(timelineEntries).values(PortfolioMapper.toTimelineRow(entry)).returning();
    if (!row) throw new Error('Falha ao criar a entrada da timeline.');
    return PortfolioMapper.toTimelineEntry(row);
  }

  async save(entry: TimelineEntry): Promise<void> {
    await db
      .update(timelineEntries)
      .set(PortfolioMapper.toTimelineRow(entry))
      .where(eq(timelineEntries.id, entry.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(timelineEntries).where(eq(timelineEntries.id, id));
  }

  async reorder(instructions: ReorderInstruction[]): Promise<void> {
    if (instructions.length === 0) return;
    await db.transaction(async (tx) => {
      for (const { id, sortOrder } of instructions) {
        await tx.update(timelineEntries).set({ sortOrder }).where(eq(timelineEntries.id, id));
      }
    });
  }

  async nextSortOrder(): Promise<number> {
    const [row] = await db.select({ value: max(timelineEntries.sortOrder) }).from(timelineEntries);
    return (row?.value ?? -1) + 1;
  }
}
