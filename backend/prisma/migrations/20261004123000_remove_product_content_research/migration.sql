-- Remove the retired SEO Content Research feature.
-- This is intentionally a forward migration: never edit/delete the already-applied
-- 20261004110000 migration from history.
DROP TABLE IF EXISTS "ProductContentResearch";
DROP TYPE IF EXISTS "ProductResearchStatus";
