// CRUD e reordenação das entradas da trajetória.

import { randomUUID } from 'node:crypto';
import { TimelineEntry, type TimelineKind } from '../../../domain/portfolio/entities/timeline-entry.js';
import type {
  ReorderInstruction,
  TimelineRepository,
} from '../../../domain/portfolio/repositories/portfolio.repositories.js';
import { LocalizedText } from '../../../domain/portfolio/value-objects/localized-text.js';
import { NotFoundError } from '../../../shared/errors/index.js';

export interface TimelinePayload {
  kind: TimelineKind;
  rolePt: string;
  roleEn: string;
  org: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  descriptionPt?: string;
  descriptionEn?: string;
  visible?: boolean;
}

export class TimelineService {
  constructor(private readonly repository: TimelineRepository) {}

  list(onlyVisible = false): Promise<TimelineEntry[]> {
    return this.repository.list({ onlyVisible });
  }

  async create(input: TimelinePayload): Promise<TimelineEntry> {
    const entry = TimelineEntry.create({
      id: randomUUID(),
      kind: input.kind,
      role: LocalizedText.create(input.rolePt, input.roleEn, 'cargo'),
      org: input.org.trim(),
      startDate: input.startDate,
      endDate: input.endDate?.trim() ? input.endDate : null,
      location: input.location ?? null,
      description: LocalizedText.create(input.descriptionPt ?? '', input.descriptionEn ?? '', 'descricao', {
        required: false,
      }),
      sortOrder: await this.repository.nextSortOrder(),
      visible: input.visible ?? true,
    });

    return this.repository.create(entry);
  }

  async update(id: string, input: Partial<TimelinePayload>): Promise<TimelineEntry> {
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('Entrada da timeline', id);

    if (input.rolePt !== undefined || input.roleEn !== undefined) {
      entry.update({
        role: LocalizedText.create(input.rolePt ?? entry.role.pt, input.roleEn ?? entry.role.en, 'cargo'),
      });
    }

    if (input.descriptionPt !== undefined || input.descriptionEn !== undefined) {
      entry.update({
        description: LocalizedText.create(
          input.descriptionPt ?? entry.description.pt,
          input.descriptionEn ?? entry.description.en,
          'descricao',
          { required: false },
        ),
      });
    }

    entry.update({
      ...(input.kind !== undefined && { kind: input.kind }),
      ...(input.org !== undefined && { org: input.org }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.endDate !== undefined && { endDate: input.endDate?.trim() ? input.endDate : null }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.visible !== undefined && { visible: input.visible }),
    });

    await this.repository.save(entry);
    return entry;
  }

  async delete(id: string): Promise<void> {
    const entry = await this.repository.findById(id);
    if (!entry) throw new NotFoundError('Entrada da timeline', id);
    await this.repository.delete(id);
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const instructions: ReorderInstruction[] = orderedIds.map((id, index) => ({ id, sortOrder: index }));
    await this.repository.reorder(instructions);
  }
}
