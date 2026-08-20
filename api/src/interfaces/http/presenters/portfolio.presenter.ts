// Converte entidades no JSON consumido pelo front.

import type { PortfolioSnapshot } from '../../../application/portfolio/services/portfolio-query.service.js';
import type { MediaAsset } from '../../../domain/portfolio/entities/media-asset.js';
import type { Project } from '../../../domain/portfolio/entities/project.js';
import type { Skill } from '../../../domain/portfolio/entities/skill.js';
import type { SkillCategory } from '../../../domain/portfolio/entities/skill-category.js';
import type { ThemeSettings } from '../../../domain/portfolio/entities/theme-settings.js';
import type { TimelineEntry } from '../../../domain/portfolio/entities/timeline-entry.js';
import type { SiteContentEntry } from '../../../domain/portfolio/repositories/portfolio.repositories.js';

export const PortfolioPresenter = {
  skill(skill: Skill) {
    return {
      id: skill.id,
      name: skill.name,
      categoryId: skill.categoryId,
      icon: skill.icon,
      level: skill.level,
      sortOrder: skill.sortOrder,
      visible: skill.visible,
    };
  },

  skillCategory(category: SkillCategory) {
    return {
      id: category.id,
      name: category.name.toJSON(),
      sortOrder: category.sortOrder,
    };
  },

  project(project: Project, media?: Map<string, MediaAsset>) {
    const cover = project.coverMediaId ? media?.get(project.coverMediaId) : undefined;

    return {
      id: project.id,
      slug: project.slug.value,
      title: project.title.toJSON(),
      description: project.description.toJSON(),
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      coverMediaId: project.coverMediaId,
      coverUrl: cover?.publicUrl ?? null,
      featured: project.featured,
      sortOrder: project.sortOrder,
      visible: project.visible,
      skillIds: project.skillIds,
    };
  },

  timelineEntry(entry: TimelineEntry) {
    return {
      id: entry.id,
      kind: entry.kind,
      role: entry.role.toJSON(),
      org: entry.org,
      startDate: entry.startDate,
      endDate: entry.endDate,
      isCurrent: entry.isCurrent,
      durationMonths: entry.durationInMonths(),
      location: entry.location,
      description: entry.description.toJSON(),
      sortOrder: entry.sortOrder,
      visible: entry.visible,
    };
  },

  media(asset: MediaAsset) {
    return {
      id: asset.id,
      filename: asset.filename,
      originalName: asset.originalName,
      mime: asset.mime,
      size: asset.size,
      url: asset.publicUrl,
      createdAt: asset.createdAt.toISOString(),
    };
  },

  content(entries: SiteContentEntry[]) {
    return Object.fromEntries(entries.map((entry) => [entry.key, entry.text.toJSON()]));
  },

  theme(settings: ThemeSettings) {
    return {
      palette: settings.palette,
      customAccent: settings.customAccent,
      defaultMode: settings.defaultMode,
    };
  },

  snapshot(snapshot: PortfolioSnapshot) {
    return {
      skills: snapshot.skills.map(PortfolioPresenter.skill),
      skillCategories: snapshot.skillCategories.map(PortfolioPresenter.skillCategory),
      projects: snapshot.projects.map((p) => PortfolioPresenter.project(p, snapshot.media)),
      timeline: snapshot.timeline.map(PortfolioPresenter.timelineEntry),
      content: PortfolioPresenter.content(snapshot.content),
      theme: PortfolioPresenter.theme(snapshot.theme),
    };
  },
};
