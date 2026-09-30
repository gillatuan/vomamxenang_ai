CREATE TYPE "DailyContentRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');
CREATE TYPE "DailyContentPlanStatus" AS ENUM ('PLANNED', 'GENERATING', 'DRAFT', 'PUBLISHED', 'FAILED');

CREATE TABLE "DailyContentRun" (
  "id" TEXT NOT NULL,
  "runDate" TEXT NOT NULL,
  "status" "DailyContentRunStatus" NOT NULL DEFAULT 'RUNNING',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "error" TEXT,
  "summary" JSONB,
  CONSTRAINT "DailyContentRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyContentPlan" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "slot" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "primaryKeyword" TEXT NOT NULL,
  "secondaryKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "searchIntent" TEXT NOT NULL,
  "cluster" TEXT NOT NULL,
  "targetProductId" TEXT,
  "postId" TEXT,
  "status" "DailyContentPlanStatus" NOT NULL DEFAULT 'PLANNED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "internalLinks" JSONB,
  "quality" JSONB,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyContentPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyContentRun_runDate_key" ON "DailyContentRun"("runDate");
CREATE UNIQUE INDEX "DailyContentPlan_slug_key" ON "DailyContentPlan"("slug");
CREATE UNIQUE INDEX "DailyContentPlan_postId_key" ON "DailyContentPlan"("postId");
CREATE UNIQUE INDEX "DailyContentPlan_runId_slot_key" ON "DailyContentPlan"("runId", "slot");
CREATE INDEX "DailyContentPlan_status_createdAt_idx" ON "DailyContentPlan"("status", "createdAt");
CREATE INDEX "DailyContentPlan_cluster_createdAt_idx" ON "DailyContentPlan"("cluster", "createdAt");
ALTER TABLE "DailyContentPlan" ADD CONSTRAINT "DailyContentPlan_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DailyContentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyContentPlan" ADD CONSTRAINT "DailyContentPlan_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DailyContentPlan" ADD CONSTRAINT "DailyContentPlan_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
