CREATE TYPE "AiGenerationType" AS ENUM ('PRODUCT', 'BLOG', 'SEO');
CREATE TYPE "AiGenerationStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Product"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "shortDescription" TEXT,
  ADD COLUMN "highlights" JSONB,
  ADD COLUMN "specifications" JSONB,
  ADD COLUMN "applications" JSONB,
  ADD COLUMN "seo" JSONB,
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

ALTER TABLE "Post"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "excerpt" TEXT,
  ADD COLUMN "tableOfContents" JSONB,
  ADD COLUMN "seo" JSONB,
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

CREATE TABLE "AiGeneration" (
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
