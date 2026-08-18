-- This migration can safely resume databases where an earlier manual schema
-- sync created some of these types before Prisma recorded the migration.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AiGenerationType') THEN
    CREATE TYPE "AiGenerationType" AS ENUM ('PRODUCT', 'BLOG', 'SEO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AiGenerationStatus') THEN
    CREATE TYPE "AiGenerationStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentStatus') THEN
    CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');
  END IF;
END $$;

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "highlights" JSONB,
  ADD COLUMN IF NOT EXISTS "specifications" JSONB,
  ADD COLUMN IF NOT EXISTS "applications" JSONB,
  ADD COLUMN IF NOT EXISTS "seo" JSONB,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

ALTER TABLE "Post"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "excerpt" TEXT,
  ADD COLUMN IF NOT EXISTS "tableOfContents" JSONB,
  ADD COLUMN IF NOT EXISTS "seo" JSONB,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");

CREATE TABLE IF NOT EXISTS "AiGeneration" (
  "id" TEXT NOT NULL,
  "type" "AiGenerationType" NOT NULL,
  "prompt" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "output" JSONB,
  "status" "AiGenerationStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT,
  "model" TEXT,
  "error" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);
