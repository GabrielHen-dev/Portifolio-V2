// Composition root: instancia adaptadores e injeta as portas nos casos de uso.

import { AuthenticateSessionUseCase } from './application/identity/use-cases/authenticate-session.use-case.js';
import { AuthenticateWithPasswordUseCase } from './application/identity/use-cases/authenticate-with-password.use-case.js';
import { LogoutUseCase } from './application/identity/use-cases/logout.use-case.js';
import { ProvisionAdminUseCase } from './application/identity/use-cases/provision-admin.use-case.js';
import { VerifySecondFactorUseCase } from './application/identity/use-cases/verify-second-factor.use-case.js';
import { MediaService } from './application/portfolio/services/media.service.js';
import { PortfolioQueryService } from './application/portfolio/services/portfolio-query.service.js';
import { ProjectService } from './application/portfolio/services/project.service.js';
import { SiteContentService } from './application/portfolio/services/site-content.service.js';
import { SkillCategoryService } from './application/portfolio/services/skill-category.service.js';
import { SkillService } from './application/portfolio/services/skill.service.js';
import { ThemeService } from './application/portfolio/services/theme.service.js';
import { TimelineService } from './application/portfolio/services/timeline.service.js';
import { DrizzleAdminUserRepository } from './infrastructure/database/repositories/drizzle-admin-user.repository.js';
import {
  DrizzleMediaRepository,
  DrizzleSiteContentRepository,
} from './infrastructure/database/repositories/drizzle-content.repository.js';
import { DrizzleProjectRepository } from './infrastructure/database/repositories/drizzle-project.repository.js';
import { DrizzleRecoveryCodeRepository } from './infrastructure/database/repositories/drizzle-recovery-code.repository.js';
import { DrizzleSessionRepository } from './infrastructure/database/repositories/drizzle-session.repository.js';
import { DrizzleSkillCategoryRepository } from './infrastructure/database/repositories/drizzle-skill-category.repository.js';
import { DrizzleSkillRepository } from './infrastructure/database/repositories/drizzle-skill.repository.js';
import { DrizzleThemeSettingsRepository } from './infrastructure/database/repositories/drizzle-theme.repository.js';
import { DrizzleTimelineRepository } from './infrastructure/database/repositories/drizzle-timeline.repository.js';
import { AuditLogger } from './infrastructure/observability/audit-logger.js';
import { AesEncryptor } from './infrastructure/security/aes-encryptor.js';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher.js';
import { CryptoTokenGenerator } from './infrastructure/security/crypto-token-generator.js';
import { OtplibTotpService } from './infrastructure/security/otplib-totp.service.js';
import { LocalMediaStorage } from './infrastructure/storage/local-media-storage.js';

export function buildContainer() {
  const encryptor = new AesEncryptor();
  const hasher = new Argon2PasswordHasher();
  const tokens = new CryptoTokenGenerator();
  const totp = new OtplibTotpService(encryptor);
  const storage = new LocalMediaStorage();
  const auditLogger = new AuditLogger();

  const userRepository = new DrizzleAdminUserRepository();
  const sessionRepository = new DrizzleSessionRepository();
  const recoveryCodeRepository = new DrizzleRecoveryCodeRepository();
  const skillRepository = new DrizzleSkillRepository();
  const skillCategoryRepository = new DrizzleSkillCategoryRepository();
  const projectRepository = new DrizzleProjectRepository();
  const timelineRepository = new DrizzleTimelineRepository();
  const contentRepository = new DrizzleSiteContentRepository();
  const mediaRepository = new DrizzleMediaRepository();
  const themeRepository = new DrizzleThemeSettingsRepository();

  const authenticateWithPassword = new AuthenticateWithPasswordUseCase(
    userRepository,
    sessionRepository,
    hasher,
    tokens,
  );
  const verifySecondFactor = new VerifySecondFactorUseCase(
    userRepository,
    sessionRepository,
    recoveryCodeRepository,
    totp,
    tokens,
  );
  const authenticateSession = new AuthenticateSessionUseCase(userRepository, sessionRepository, tokens);
  const logout = new LogoutUseCase(sessionRepository, tokens);
  const provisionAdmin = new ProvisionAdminUseCase(userRepository, recoveryCodeRepository, hasher, totp, tokens);

  const skillService = new SkillService(skillRepository, skillCategoryRepository);
  const skillCategoryService = new SkillCategoryService(skillCategoryRepository);
  const projectService = new ProjectService(projectRepository, skillRepository);
  const timelineService = new TimelineService(timelineRepository);
  const contentService = new SiteContentService(contentRepository);
  const mediaService = new MediaService(mediaRepository, storage);
  const themeService = new ThemeService(themeRepository);
  const portfolioQuery = new PortfolioQueryService(
    skillRepository,
    projectRepository,
    timelineRepository,
    contentRepository,
    mediaRepository,
    themeRepository,
    skillCategoryRepository,
  );

  return {
    auditLogger,
    storage,
    sessionRepository,
    identity: {
      authenticateWithPassword,
      verifySecondFactor,
      authenticateSession,
      logout,
      provisionAdmin,
    },
    portfolio: {
      skills: skillService,
      skillCategories: skillCategoryService,
      projects: projectService,
      timeline: timelineService,
      content: contentService,
      media: mediaService,
      theme: themeService,
      query: portfolioQuery,
    },
  };
}

export type Container = ReturnType<typeof buildContainer>;
