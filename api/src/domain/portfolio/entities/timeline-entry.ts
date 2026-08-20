// Entidade TimelineEntry: experiência/formação com período MM/AAAA e duração.

import { ValidationError } from '../../../shared/errors/index.js';
import { LocalizedText } from '../value-objects/localized-text.js';

export const TIMELINE_KINDS = ['experience', 'education'] as const;
export type TimelineKind = (typeof TIMELINE_KINDS)[number];

const PERIOD_PATTERN = /^(0[1-9]|1[0-2])\/\d{4}$/;

export interface TimelineEntryProps {
  id: string;
  kind: TimelineKind;
  role: LocalizedText;
  org: string;

  startDate: string;

  endDate: string | null;
  location: string | null;
  description: LocalizedText;
  sortOrder: number;
  visible: boolean;
}

export class TimelineEntry {
  private constructor(private props: TimelineEntryProps) {}

  static restore(props: TimelineEntryProps): TimelineEntry {
    return new TimelineEntry(props);
  }

  static create(props: TimelineEntryProps): TimelineEntry {
    TimelineEntry.assertKind(props.kind);
    TimelineEntry.assertPeriod(props.startDate, props.endDate);
    return new TimelineEntry(props);
  }

  private static assertKind(kind: string): asserts kind is TimelineKind {
    if (!TIMELINE_KINDS.includes(kind as TimelineKind)) {
      throw new ValidationError(`Tipo invalido. Use: ${TIMELINE_KINDS.join(' ou ')}.`, 'kind');
    }
  }

  private static assertPeriod(start: string, end: string | null): void {
    if (!PERIOD_PATTERN.test(start)) {
      throw new ValidationError('Data de inicio deve estar no formato MM/AAAA.', 'startDate');
    }
    if (end !== null && end !== '') {
      if (!PERIOD_PATTERN.test(end)) {
        throw new ValidationError('Data de fim deve estar no formato MM/AAAA.', 'endDate');
      }
      if (TimelineEntry.toComparable(end) < TimelineEntry.toComparable(start)) {
        throw new ValidationError('A data de fim nao pode ser anterior a de inicio.', 'endDate');
      }
    }
  }

  private static toComparable(period: string): number {
    const [month, year] = period.split('/');
    return Number(year) * 100 + Number(month);
  }

  get id(): string {
    return this.props.id;
  }
  get kind(): TimelineKind {
    return this.props.kind;
  }
  get role(): LocalizedText {
    return this.props.role;
  }
  get org(): string {
    return this.props.org;
  }
  get startDate(): string {
    return this.props.startDate;
  }
  get endDate(): string | null {
    return this.props.endDate;
  }
  get location(): string | null {
    return this.props.location;
  }
  get description(): LocalizedText {
    return this.props.description;
  }
  get sortOrder(): number {
    return this.props.sortOrder;
  }
  get visible(): boolean {
    return this.props.visible;
  }

  get isCurrent(): boolean {
    return this.props.endDate === null;
  }

  durationInMonths(reference: Date = new Date()): number {
    const start = TimelineEntry.toComparable(this.props.startDate);

    const end = this.props.endDate
      ? TimelineEntry.toComparable(this.props.endDate)
      : (reference.getFullYear() * 100 + (reference.getMonth() + 1));

    const startYear = Math.floor(start / 100);
    const startMonth = start % 100;
    const endYear = Math.floor(end / 100);
    const endMonth = end % 100;

    const months = (endYear - startYear) * 12 + (endMonth - startMonth);

    return Math.max(months, 1);
  }

  update(changes: Partial<Omit<TimelineEntryProps, 'id'>>): void {
    const nextStart = changes.startDate ?? this.props.startDate;
    const nextEnd = changes.endDate !== undefined ? changes.endDate : this.props.endDate;

    if (changes.kind !== undefined) {
      TimelineEntry.assertKind(changes.kind);
      this.props.kind = changes.kind;
    }
    if (changes.startDate !== undefined || changes.endDate !== undefined) {
      TimelineEntry.assertPeriod(nextStart, nextEnd);
      this.props.startDate = nextStart;
      this.props.endDate = nextEnd === '' ? null : nextEnd;
    }
    if (changes.role !== undefined) this.props.role = changes.role;
    if (changes.org !== undefined) this.props.org = changes.org.trim();
    if (changes.location !== undefined) this.props.location = changes.location;
    if (changes.description !== undefined) this.props.description = changes.description;
    if (changes.sortOrder !== undefined) this.props.sortOrder = changes.sortOrder;
    if (changes.visible !== undefined) this.props.visible = changes.visible;
  }

  toSnapshot(): TimelineEntryProps {
    return { ...this.props };
  }
}
