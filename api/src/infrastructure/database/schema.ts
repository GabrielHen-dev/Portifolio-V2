// Schema Drizzle: tabelas, índices e chaves do banco.

import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default('Admin'),
  passwordHash: text('password_hash').notNull(),

  totpSecret: text('totp_secret'),
  totpEnabled: boolean('totp_enabled').notNull().default(false),
  lastTotpCounter: integer('last_totp_counter'),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tokenHash: text('token_hash').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    mfaPending: boolean('mfa_pending').notNull().default(true),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('sessions_token_hash_idx').on(t.tokenHash),
    index('sessions_user_idx').on(t.userId),
    index('sessions_expires_idx').on(t.expiresAt),
  ],
);

export const recoveryCodes = pgTable(
  'recovery_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('recovery_codes_user_idx').on(t.userId)],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => adminUsers.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entity: text('entity'),
    entityId: text('entity_id'),
    ip: text('ip'),
    detail: text('detail'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_logs_created_idx').on(t.createdAt)],
);

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  filename: text('filename').notNull().unique(),
  originalName: text('original_name').notNull(),
  mime: text('mime').notNull(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const skillCategories = pgTable(
  'skill_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    namePt: text('name_pt').notNull(),
    nameEn: text('name_en').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('skill_categories_sort_idx').on(t.sortOrder)],
);

export const skills = pgTable(
  'skills',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),

    categoryId: uuid('category_id')
      .notNull()
      .references(() => skillCategories.id, { onDelete: 'restrict' }),
    icon: text('icon'),
    level: integer('level').notNull().default(3),
    sortOrder: integer('sort_order').notNull().default(0),
    visible: boolean('visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('skills_sort_idx').on(t.sortOrder), index('skills_category_idx').on(t.categoryId)],
);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    titlePt: text('title_pt').notNull(),
    titleEn: text('title_en').notNull(),
    descriptionPt: text('description_pt').notNull().default(''),
    descriptionEn: text('description_en').notNull().default(''),
    repoUrl: text('repo_url'),
    demoUrl: text('demo_url'),
    coverMediaId: uuid('cover_media_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
    featured: boolean('featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    visible: boolean('visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('projects_sort_idx').on(t.sortOrder)],
);

export const projectSkills = pgTable(
  'project_skills',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.skillId] })],
);

export const timelineEntries = pgTable(
  'timeline_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').notNull(),
    rolePt: text('role_pt').notNull(),
    roleEn: text('role_en').notNull(),
    org: text('org').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
    location: text('location'),
    descriptionPt: text('description_pt').notNull().default(''),
    descriptionEn: text('description_en').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    visible: boolean('visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('timeline_sort_idx').on(t.sortOrder)],
);

export const siteTheme = pgTable('site_theme', {
  id: text('id').primaryKey().default('default'),
  palette: text('palette').notNull().default('redline'),
  customAccent: text('custom_accent'),
  defaultMode: text('default_mode').notNull().default('dark'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const siteContent = pgTable('site_content', {
  key: text('key').primaryKey(),
  valuePt: text('value_pt').notNull().default(''),
  valueEn: text('value_en').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
