ALTER TABLE "site_theme" ALTER COLUMN "palette" SET DEFAULT 'redline';--> statement-breakpoint
ALTER TABLE "site_theme" ALTER COLUMN "default_mode" SET DEFAULT 'dark';--> statement-breakpoint
-- Migracao de dados: os ids de paleta foram renomeados junto com a mudanca de
-- identidade visual (editorial -> telemetria). Sem este UPDATE, a linha ja
-- gravada continuaria apontando para um id que nao existe mais em CSS nenhum,
-- e o site abriria sem cor de destaque — falha silenciosa, sem erro no log.
UPDATE "site_theme"
SET "palette" = CASE "palette"
  WHEN 'indigo' THEN 'redline'
  WHEN 'lime'   THEN 'acid'
  WHEN 'cyan'   THEN 'hud'
  ELSE "palette"
END
WHERE "palette" IN ('indigo', 'lime', 'cyan');
