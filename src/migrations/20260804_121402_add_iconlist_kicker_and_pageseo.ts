import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_icon_list_locales" ADD COLUMN "kicker" varchar;
  ALTER TABLE "_pages_v_blocks_icon_list_locales" ADD COLUMN "kicker" varchar;
  ALTER TABLE "services_blocks_icon_list_locales" ADD COLUMN "kicker" varchar;
  ALTER TABLE "_services_v_blocks_icon_list_locales" ADD COLUMN "kicker" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "page_seo_home_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "page_seo_home_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "page_seo_services_list_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "page_seo_services_list_description" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "page_seo_portfolio_list_title" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "page_seo_portfolio_list_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_icon_list_locales" DROP COLUMN "kicker";
  ALTER TABLE "_pages_v_blocks_icon_list_locales" DROP COLUMN "kicker";
  ALTER TABLE "services_blocks_icon_list_locales" DROP COLUMN "kicker";
  ALTER TABLE "_services_v_blocks_icon_list_locales" DROP COLUMN "kicker";
  ALTER TABLE "site_settings_locales" DROP COLUMN "page_seo_home_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "page_seo_home_description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "page_seo_services_list_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "page_seo_services_list_description";
  ALTER TABLE "site_settings_locales" DROP COLUMN "page_seo_portfolio_list_title";
  ALTER TABLE "site_settings_locales" DROP COLUMN "page_seo_portfolio_list_description";`)
}
