ALTER TABLE "skills" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_skill_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."skill_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "skills_category_idx" ON "skills" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "skills" DROP COLUMN "category";