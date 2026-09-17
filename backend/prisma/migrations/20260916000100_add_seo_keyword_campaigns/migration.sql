-- Batch 1 SEO/AI System V3.1. This migration is additive and preserves
-- existing public content, audit reports and backlink records.

CREATE TYPE "SeoKeywordType" AS ENUM ('PRIMARY', 'SECONDARY', 'SUPPORTING', 'BRANDED', 'LOCAL');
CREATE TYPE "SeoKeywordIntent" AS ENUM ('INFORMATIONAL', 'NAVIGATIONAL', 'COMMERCIAL', 'TRANSACTIONAL');
CREATE TYPE "SeoKeywordStatus" AS ENUM ('PLANNED', 'ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "SeoAuditScope" AS ENUM ('SITE', 'PRODUCT', 'POST');
CREATE TYPE "SeoAuditStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

ALTER TABLE "SeoAudit"
  ADD COLUMN "scope" "SeoAuditScope" NOT NULL DEFAULT 'SITE',
  ADD COLUMN "status" "SeoAuditStatus" NOT NULL DEFAULT 'COMPLETED',
  ADD COLUMN "productId" TEXT,
  ADD COLUMN "postId" TEXT,
  ADD COLUMN "subjectUrl" TEXT,
  ADD COLUMN "primaryKeyword" TEXT,
  ADD COLUMN "metaTitle" TEXT,
  ADD COLUMN "metaDescription" TEXT,
  ADD COLUMN "canonical" TEXT,
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "headingStructure" JSONB,
  ADD COLUMN "internalLinks" JSONB,
  ADD COLUMN "issues" JSONB,
  ADD COLUMN "score" INTEGER;

CREATE TABLE "SeoKeyword" (
  "id" TEXT NOT NULL,
  "keyword" TEXT NOT NULL,
  "type" "SeoKeywordType" NOT NULL DEFAULT 'PRIMARY',
  "intent" "SeoKeywordIntent" NOT NULL DEFAULT 'INFORMATIONAL',
  "priority" INTEGER NOT NULL DEFAULT 3,
  "cluster" TEXT,
  "targetUrl" TEXT NOT NULL,
  "productId" TEXT,
  "postId" TEXT,
  "status" "SeoKeywordStatus" NOT NULL DEFAULT 'PLANNED',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SeoKeyword_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentCampaign" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "goal" TEXT,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CampaignPost" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "plannedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CampaignPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeoKeyword_keyword_key" ON "SeoKeyword"("keyword");
CREATE INDEX "SeoKeyword_cluster_status_idx" ON "SeoKeyword"("cluster", "status");
CREATE INDEX "SeoKeyword_productId_idx" ON "SeoKeyword"("productId");
CREATE INDEX "SeoKeyword_postId_idx" ON "SeoKeyword"("postId");
CREATE INDEX "SeoKeyword_status_priority_idx" ON "SeoKeyword"("status", "priority");

CREATE INDEX "SeoAudit_scope_createdAt_idx" ON "SeoAudit"("scope", "createdAt");
CREATE INDEX "SeoAudit_productId_createdAt_idx" ON "SeoAudit"("productId", "createdAt");
CREATE INDEX "SeoAudit_postId_createdAt_idx" ON "SeoAudit"("postId", "createdAt");

CREATE UNIQUE INDEX "ContentCampaign_slug_key" ON "ContentCampaign"("slug");
CREATE INDEX "ContentCampaign_status_startsAt_idx" ON "ContentCampaign"("status", "startsAt");
CREATE UNIQUE INDEX "CampaignPost_campaignId_postId_key" ON "CampaignPost"("campaignId", "postId");
CREATE INDEX "CampaignPost_campaignId_sortOrder_idx" ON "CampaignPost"("campaignId", "sortOrder");
CREATE INDEX "CampaignPost_postId_idx" ON "CampaignPost"("postId");

ALTER TABLE "SeoAudit" ADD CONSTRAINT "SeoAudit_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SeoAudit" ADD CONSTRAINT "SeoAudit_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SeoKeyword" ADD CONSTRAINT "SeoKeyword_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SeoKeyword" ADD CONSTRAINT "SeoKeyword_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CampaignPost" ADD CONSTRAINT "CampaignPost_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ContentCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CampaignPost" ADD CONSTRAINT "CampaignPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
