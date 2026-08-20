// CRUD autenticado de categorias, skills, projetos, timeline, textos, tema e mídia.

import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../container.js';
import { MAX_UPLOAD_BYTES } from '../../../domain/portfolio/entities/media-asset.js';
import { ValidationError } from '../../../shared/errors/index.js';
import { PortfolioPresenter } from '../presenters/portfolio.presenter.js';
import { createRequireAdmin, enforceOrigin } from '../middlewares/session.middleware.js';
import {
  createProjectSchema,
  createSkillCategorySchema,
  createSkillSchema,
  createTimelineSchema,
  idParamSchema,
  reorderSchema,
  saveContentSchema,
  updateProjectSchema,
  updateSkillCategorySchema,
  updateSkillSchema,
  updateThemeSchema,
  updateTimelineSchema,
} from '../schemas/portfolio.schemas.js';

export async function adminRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const requireAdmin = createRequireAdmin(container);

  app.addHook('preHandler', enforceOrigin);
  app.addHook('preHandler', requireAdmin);

  const { skills, skillCategories, projects, timeline, content, media, theme } = container.portfolio;

  app.get('/skill-categories', async (_request, reply) => {
    const list = await skillCategories.list();
    return reply.send(list.map(PortfolioPresenter.skillCategory));
  });

  app.post('/skill-categories', async (request, reply) => {
    const body = createSkillCategorySchema.parse(request.body);
    const category = await skillCategories.create(body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'skill_category.create',
      entity: 'skill_category',
      entityId: category.id,
      ip: request.ip,
      detail: category.name.pt,
    });

    return reply.code(201).send(PortfolioPresenter.skillCategory(category));
  });

  app.patch('/skill-categories/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateSkillCategorySchema.parse(request.body);
    const category = await skillCategories.update(id, body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'skill_category.update',
      entity: 'skill_category',
      entityId: id,
      ip: request.ip,
    });

    return reply.send(PortfolioPresenter.skillCategory(category));
  });

  app.delete('/skill-categories/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await skillCategories.delete(id);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'skill_category.delete',
      entity: 'skill_category',
      entityId: id,
      ip: request.ip,
    });

    return reply.code(204).send();
  });

  app.post('/skill-categories/reorder', async (request, reply) => {
    const { ids } = reorderSchema.parse(request.body);
    await skillCategories.reorder(ids);
    return reply.send({ status: 'ok' });
  });

  app.get('/skills', async (_request, reply) => {
    const list = await skills.list(false);
    return reply.send(list.map(PortfolioPresenter.skill));
  });

  app.post('/skills', async (request, reply) => {
    const body = createSkillSchema.parse(request.body);
    const skill = await skills.create(body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'skill.create',
      entity: 'skill',
      entityId: skill.id,
      ip: request.ip,
      detail: skill.name,
    });

    return reply.code(201).send(PortfolioPresenter.skill(skill));
  });

  app.patch('/skills/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateSkillSchema.parse(request.body);
    const skill = await skills.update(id, body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'skill.update',
      entity: 'skill',
      entityId: id,
      ip: request.ip,
    });

    return reply.send(PortfolioPresenter.skill(skill));
  });

  app.delete('/skills/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await skills.delete(id);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'skill.delete',
      entity: 'skill',
      entityId: id,
      ip: request.ip,
    });

    return reply.code(204).send();
  });

  app.post('/skills/reorder', async (request, reply) => {
    const { ids } = reorderSchema.parse(request.body);
    await skills.reorder(ids);
    return reply.send({ status: 'ok' });
  });

  app.get('/projects', async (_request, reply) => {
    const list = await projects.list(false);
    return reply.send(list.map((p) => PortfolioPresenter.project(p)));
  });

  app.post('/projects', async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    const project = await projects.create(body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'project.create',
      entity: 'project',
      entityId: project.id,
      ip: request.ip,
      detail: project.slug.value,
    });

    return reply.code(201).send(PortfolioPresenter.project(project));
  });

  app.patch('/projects/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateProjectSchema.parse(request.body);
    const project = await projects.update(id, body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'project.update',
      entity: 'project',
      entityId: id,
      ip: request.ip,
    });

    return reply.send(PortfolioPresenter.project(project));
  });

  app.delete('/projects/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await projects.delete(id);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'project.delete',
      entity: 'project',
      entityId: id,
      ip: request.ip,
    });

    return reply.code(204).send();
  });

  app.post('/projects/reorder', async (request, reply) => {
    const { ids } = reorderSchema.parse(request.body);
    await projects.reorder(ids);
    return reply.send({ status: 'ok' });
  });

  app.get('/timeline', async (_request, reply) => {
    const list = await timeline.list(false);
    return reply.send(list.map(PortfolioPresenter.timelineEntry));
  });

  app.post('/timeline', async (request, reply) => {
    const body = createTimelineSchema.parse(request.body);
    const entry = await timeline.create(body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'timeline.create',
      entity: 'timeline',
      entityId: entry.id,
      ip: request.ip,
      detail: entry.org,
    });

    return reply.code(201).send(PortfolioPresenter.timelineEntry(entry));
  });

  app.patch('/timeline/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateTimelineSchema.parse(request.body);
    const entry = await timeline.update(id, body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'timeline.update',
      entity: 'timeline',
      entityId: id,
      ip: request.ip,
    });

    return reply.send(PortfolioPresenter.timelineEntry(entry));
  });

  app.delete('/timeline/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await timeline.delete(id);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'timeline.delete',
      entity: 'timeline',
      entityId: id,
      ip: request.ip,
    });

    return reply.code(204).send();
  });

  app.post('/timeline/reorder', async (request, reply) => {
    const { ids } = reorderSchema.parse(request.body);
    await timeline.reorder(ids);
    return reply.send({ status: 'ok' });
  });

  app.get('/content', async (_request, reply) => {
    const entries = await content.all();
    return reply.send(PortfolioPresenter.content(entries));
  });

  app.put('/content', async (request, reply) => {
    const body = saveContentSchema.parse(request.body);
    await content.saveMany(body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'content.update',
      entity: 'site_content',
      ip: request.ip,
      detail: Object.keys(body).join(', '),
    });

    return reply.send({ status: 'ok' });
  });

  app.get('/theme', async (_request, reply) => {
    const settings = await theme.get();
    return reply.send(PortfolioPresenter.theme(settings));
  });

  app.put('/theme', async (request, reply) => {
    const body = updateThemeSchema.parse(request.body);
    const settings = await theme.update(body);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'theme.update',
      entity: 'site_theme',
      ip: request.ip,
      detail: `${settings.palette}${settings.customAccent ? ` custom=${settings.customAccent}` : ''}`,
    });

    return reply.send(PortfolioPresenter.theme(settings));
  });

  app.get('/media', async (_request, reply) => {
    const list = await media.list();
    return reply.send(list.map(PortfolioPresenter.media));
  });

  app.post('/media', async (request, reply) => {
    const file = await request.file({ limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } });
    if (!file) throw new ValidationError('Nenhum arquivo enviado.', 'file');

    const buffer = await file.toBuffer();

    if (file.file.truncated) {
      throw new ValidationError(`Arquivo acima do limite de ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`, 'file');
    }

    const asset = await media.upload({ buffer, originalName: file.filename });

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'media.upload',
      entity: 'media',
      entityId: asset.id,
      ip: request.ip,
      detail: `${asset.mime} ${asset.size}B`,
    });

    return reply.code(201).send(PortfolioPresenter.media(asset));
  });

  app.delete('/media/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await media.delete(id);

    await container.auditLogger.record({
      userId: request.admin!.id,
      action: 'media.delete',
      entity: 'media',
      entityId: id,
      ip: request.ip,
    });

    return reply.code(204).send();
  });
}
