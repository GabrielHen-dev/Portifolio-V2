// Portas de persistência do portfólio (skills, categorias, projetos, timeline, conteúdo, mídia, tema).

import type { MediaAsset } from '../entities/media-asset.js';
import type { Project } from '../entities/project.js';
import type { Skill } from '../entities/skill.js';
import type { SkillCategory } from '../entities/skill-category.js';
import type { ThemeSettings } from '../entities/theme-settings.js';
import type { TimelineEntry } from '../entities/timeline-entry.js';
import type { LocalizedText } from '../value-objects/localized-text.js';

export interface ListOptions {
  onlyVisible?: boolean;
}

export interface ReorderInstruction {
  id: string;
  sortOrder: number;
}

export interface SkillCategoryRepository {
  list(): Promise<SkillCategory[]>;
  findById(id: string): Promise<SkillCategory | null>;
  create(category: SkillCategory): Promise<SkillCategory>;
  save(category: SkillCategory): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(instructions: ReorderInstruction[]): Promise<void>;
  nextSortOrder(): Promise<number>;

  countSkills(categoryId: string): Promise<number>;
}

export interface SkillRepository {
  list(options?: ListOptions): Promise<Skill[]>;
  findById(id: string): Promise<Skill | null>;
  create(skill: Skill): Promise<Skill>;
  save(skill: Skill): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(instructions: ReorderInstruction[]): Promise<void>;
  nextSortOrder(): Promise<number>;
}

export interface ProjectRepository {
  list(options?: ListOptions): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(instructions: ReorderInstruction[]): Promise<void>;
  nextSortOrder(): Promise<number>;
}

export interface TimelineRepository {
  list(options?: ListOptions): Promise<TimelineEntry[]>;
  findById(id: string): Promise<TimelineEntry | null>;
  create(entry: TimelineEntry): Promise<TimelineEntry>;
  save(entry: TimelineEntry): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(instructions: ReorderInstruction[]): Promise<void>;
  nextSortOrder(): Promise<number>;
}

export interface SiteContentEntry {
  key: string;
  text: LocalizedText;
}

export interface SiteContentRepository {
  all(): Promise<SiteContentEntry[]>;
  upsertMany(entries: SiteContentEntry[]): Promise<void>;
}

export interface MediaRepository {
  list(): Promise<MediaAsset[]>;
  findById(id: string): Promise<MediaAsset | null>;
  create(asset: MediaAsset): Promise<MediaAsset>;
  delete(id: string): Promise<void>;
}

export interface ThemeSettingsRepository {
  get(): Promise<ThemeSettings>;
  save(settings: ThemeSettings): Promise<void>;
}

export interface MediaStorage {
  save(buffer: Buffer, filename: string): Promise<void>;
  remove(filename: string): Promise<void>;
}
