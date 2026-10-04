CREATE TYPE "ProductResearchStatus" AS ENUM ('RESEARCHING', 'READY_FOR_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

CREATE TABLE "ProductContentResearch" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "status" "ProductResearchStatus" NOT NULL DEFAULT 'RESEARCHING',
  "sources" JSONB NOT NULL DEFAULT '[]',
  "facts" JSONB NOT NULL DEFAULT '[]',
  "proposedContent" JSONB NOT NULL DEFAULT '{}',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductContentResearch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProductContentResearch_productId_status_idx" ON "ProductContentResearch"("productId","status");
CREATE INDEX "ProductContentResearch_status_createdAt_idx" ON "ProductContentResearch"("status","createdAt");
ALTER TABLE "ProductContentResearch" ADD CONSTRAINT "ProductContentResearch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
