// Tipos do contrato da API pública.

import type { DefaultMode, PaletteId } from '@/shared/theme/palettes';

export type { DefaultMode, PaletteId };

export type TimelineKind = 'experience' | 'education';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface Skill {
  id: string;
  name: string;
  categoryId: string;
  icon: string | null;
  level: number;
  sortOrder: number;
  visible: boolean;
}

export interface SkillCategoryDto {
  id: string;
  name: LocalizedText;
  sortOrder: number;
}

export interface Project {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  repoUrl: string | null;
  demoUrl: string | null;
  coverMediaId: string | null;
  coverUrl: string | null;
  featured: boolean;
  sortOrder: number;
  visible: boolean;
  skillIds: string[];
}

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  role: LocalizedText;
  org: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;

  durationMonths: number;
  location: string | null;
  description: LocalizedText;
  sortOrder: number;
  visible: boolean;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mime: string;
  size: number;
  url: string;
  createdAt: string;
}

export type SiteContent = Record<string, LocalizedText>;

export interface ThemeResponse {
  palette: PaletteId;
  customAccent: string | null;
  defaultMode: DefaultMode;
}

export interface PortfolioSnapshot {
  skills: Skill[];
  skillCategories: SkillCategoryDto[];
  projects: Project[];
  timeline: TimelineEntry[];
  content: SiteContent;
  theme: ThemeResponse;
}
