// Converte linhas do banco em entidades do portfólio e vice-versa.

import { MediaAsset, type AllowedMime } from '../../../domain/portfolio/entities/media-asset.js';
import { Project } from '../../../domain/portfolio/entities/project.js';
import { Skill } from '../../../domain/portfolio/entities/skill.js';
import { SkillCategory } from '../../../domain/portfolio/entities/skill-category.js';
import {
  ThemeSettings,
  type DefaultMode,
  type PaletteId,
} from '../../../domain/portfolio/entities/theme-settings.js';
import { TimelineEntry, type TimelineKind } from '../../../domain/portfolio/entities/timeline-entry.js';
import { LocalizedText } from '../../../domain/portfolio/value-objects/localized-text.js';
import { Slug } from '../../../domain/portfolio/value-objects/slug.js';
import type { mediaAssets, projects, siteTheme, skillCategories, skills, timelineEntries } from '../schema.js';

type SkillRow = typeof skills.$inferSelect;
type SkillCategoryRow = typeof skillCategories.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type TimelineRow = typeof timelineEntries.$inferSelect;
type MediaRow = typeof mediaAssets.$inferSelect;
type ThemeRow = typeof siteTheme.$inferSelect;

export const PortfolioMapper = {
  toSkill(row: SkillRow): Skill {
    return Skill.restore({
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      icon: row.icon,
      level: row.level,
      sortOrder: row.sortOrder,
      visible: row.visible,
    });
  },

  toSkillRow(skill: Skill) {
    const s = skill.toSnapshot();
    return {
      name: s.name,
      categoryId: s.categoryId,
      icon: s.icon,
      level: s.level,
      sortOrder: s.sortOrder,
      visible: s.visible,
    };
  },

  toSkillCategory(row: SkillCategoryRow): SkillCategory {
    return SkillCategory.restore({
      id: row.id,
      name: LocalizedText.create(row.namePt, row.nameEn, 'name', { required: false }),
      sortOrder: row.sortOrder,
    });
  },

  toSkillCategoryRow(category: SkillCategory) {
    const s = category.toSnapshot();
    return {
      namePt: s.name.pt,
      nameEn: s.name.en,
      sortOrder: s.sortOrder,
    };
  },

  toProject(row: ProjectRow, skillIds: string[]): Project {
    return Project.restore({
      id: row.id,
      slug: Slug.create(row.slug),
      title: LocalizedText.create(row.titlePt, row.titleEn, 'title', { required: false }),
      description: LocalizedText.create(row.descriptionPt, row.descriptionEn, 'description', {
        required: false,
      }),
      repoUrl: row.repoUrl,
      demoUrl: row.demoUrl,
      coverMediaId: row.coverMediaId,
      featured: row.featured,
      sortOrder: row.sortOrder,
      visible: row.visible,
      skillIds,
    });
  },

  toProjectRow(project: Project) {
    const s = project.toSnapshot();
    return {
      slug: s.slug.value,
      titlePt: s.title.pt,
      titleEn: s.title.en,
      descriptionPt: s.description.pt,
      descriptionEn: s.description.en,
      repoUrl: s.repoUrl,
      demoUrl: s.demoUrl,
      coverMediaId: s.coverMediaId,
      featured: s.featured,
      sortOrder: s.sortOrder,
      visible: s.visible,
    };
  },

  toTimelineEntry(row: TimelineRow): TimelineEntry {
    return TimelineEntry.restore({
      id: row.id,
      kind: row.kind as TimelineKind,
      role: LocalizedText.create(row.rolePt, row.roleEn, 'role', { required: false }),
      org: row.org,
      startDate: row.startDate,
      endDate: row.endDate,
      location: row.location,
      description: LocalizedText.create(row.descriptionPt, row.descriptionEn, 'description', {
        required: false,
      }),
      sortOrder: row.sortOrder,
      visible: row.visible,
    });
  },

  toTimelineRow(entry: TimelineEntry) {
    const s = entry.toSnapshot();
    return {
      kind: s.kind,
      rolePt: s.role.pt,
      roleEn: s.role.en,
      org: s.org,
      startDate: s.startDate,
      endDate: s.endDate,
      location: s.location,
      descriptionPt: s.description.pt,
      descriptionEn: s.description.en,
      sortOrder: s.sortOrder,
      visible: s.visible,
    };
  },

  toThemeSettings(row: ThemeRow): ThemeSettings {
    return ThemeSettings.restore({
      palette: row.palette as PaletteId,
      customAccent: row.customAccent,
      defaultMode: row.defaultMode as DefaultMode,
    });
  },

  toThemeRow(settings: ThemeSettings) {
    const s = settings.toSnapshot();
    return {
      palette: s.palette,
      customAccent: s.customAccent,
      defaultMode: s.defaultMode,
    };
  },

  toMediaAsset(row: MediaRow): MediaAsset {
    return MediaAsset.restore({
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      mime: row.mime as AllowedMime,
      size: row.size,
      createdAt: row.createdAt,
    });
  },
};
