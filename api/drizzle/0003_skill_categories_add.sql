CREATE TABLE "skill_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_pt" text NOT NULL,
	"name_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "category_id" uuid;--> statement-breakpoint
CREATE INDEX "skill_categories_sort_idx" ON "skill_categories" USING btree ("sort_order");--> statement-breakpoint
-- Migracao de dados: as categorias eram um enum no codigo (language, frontend,
-- devops, practice, data). Este bloco cria as equivalentes como linhas — mais a
-- nova "Banco de Dados" — e aponta as skills existentes para elas.
--
-- Condicional em EXISTS(skills): num banco recem-criado quem popula categorias
-- e o seed; inserir aqui tambem duplicaria as seis.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "skills") THEN
    INSERT INTO "skill_categories" ("name_pt", "name_en", "sort_order") VALUES
      ('Linguagens', 'Languages', 0),
      ('Front-end', 'Frontend', 1),
      ('DevOps', 'DevOps', 2),
      ('Banco de Dados', 'Databases', 3),
      ('Praticas', 'Practices', 4),
      ('Dados e IA', 'Data & AI', 5);

    UPDATE "skills" s SET "category_id" = c."id"
    FROM "skill_categories" c
    WHERE (s."category" = 'language' AND c."name_pt" = 'Linguagens')
       OR (s."category" = 'frontend' AND c."name_pt" = 'Front-end')
       OR (s."category" = 'devops'   AND c."name_pt" = 'DevOps')
       OR (s."category" = 'practice' AND c."name_pt" = 'Praticas')
       OR (s."category" = 'data'     AND c."name_pt" = 'Dados e IA');

    -- Valor desconhecido (nao deveria existir, mas custa uma linha): cai na
    -- primeira categoria em vez de quebrar o NOT NULL da proxima migracao.
    UPDATE "skills" SET "category_id" =
      (SELECT "id" FROM "skill_categories" ORDER BY "sort_order" LIMIT 1)
    WHERE "category_id" IS NULL;
  END IF;
END $$;
