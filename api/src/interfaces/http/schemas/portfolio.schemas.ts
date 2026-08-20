// Schemas Zod das entradas do painel.

import { z } from 'zod';
import { DEFAULT_MODES, PALETTE_IDS } from '../../../domain/portfolio/entities/theme-settings.js';
import { TIMELINE_KINDS } from '../../../domain/portfolio/entities/timeline-entry.js';
import { CONTENT_KEYS } from '../../../application/portfolio/services/site-content.service.js';

const uuid = z.string().uuid('Identificador invalido.');

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .optional();

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const createSkillSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(60),
  categoryId: uuid,
  icon: z.string().trim().max(40).nullable().optional(),
  level: z.number().int().min(1).max(5).optional(),
  visible: z.boolean().optional(),
});

export const updateSkillSchema = createSkillSchema.partial();

export const createSkillCategorySchema = z.object({
  namePt: z.string().trim().min(1, 'Informe o nome em portugues.').max(40),
  nameEn: z.string().trim().min(1, 'Informe o nome em ingles.').max(40),
});

export const updateSkillCategorySchema = createSkillCategorySchema.partial();

export const createProjectSchema = z.object({
  slug: optionalText(80),
  titlePt: z.string().trim().min(1, 'Informe o titulo em portugues.').max(120),
  titleEn: z.string().trim().min(1, 'Informe o titulo em ingles.').max(120),
  descriptionPt: z.string().trim().max(2000).default(''),
  descriptionEn: z.string().trim().max(2000).default(''),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  coverMediaId: uuid.nullable().optional(),
  featured: z.boolean().optional(),
  visible: z.boolean().optional(),
  skillIds: z.array(uuid).max(30).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

const period = z
  .string()
  .trim()
  .regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Use o formato MM/AAAA.');

export const createTimelineSchema = z.object({
  kind: z.enum(TIMELINE_KINDS),
  rolePt: z.string().trim().min(1).max(120),
  roleEn: z.string().trim().min(1).max(120),
  org: z.string().trim().min(1).max(120),
  startDate: period,
  endDate: period.or(z.literal('')).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  descriptionPt: z.string().trim().max(2000).optional(),
  descriptionEn: z.string().trim().max(2000).optional(),
  visible: z.boolean().optional(),
});

export const updateTimelineSchema = createTimelineSchema.partial();

export const saveContentSchema = z.record(
  z.enum(CONTENT_KEYS),
  z.object({
    pt: z.string().max(4000),
    en: z.string().max(4000),
  }),
);

export const updateThemeSchema = z.object({
  palette: z.enum(PALETTE_IDS).optional(),

  customAccent: z
    .string()
    .trim()
    .max(7)
    .nullable()
    .optional(),
  defaultMode: z.enum(DEFAULT_MODES).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(uuid).min(1).max(200),
});

export const idParamSchema = z.object({ id: uuid });
