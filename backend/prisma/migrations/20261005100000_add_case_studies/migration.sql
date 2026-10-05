CREATE TABLE "CaseStudy" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT,
  "content" TEXT,
  "tireSize" TEXT,
  "forkliftType" TEXT,
  "serviceType" TEXT,
  "area" TEXT,
  "beforeImageUrl" TEXT,
  "afterImageUrl" TEXT,
  "productId" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");
CREATE INDEX "CaseStudy_isPublished_completedAt_idx" ON "CaseStudy"("isPublished", "completedAt");
CREATE INDEX "CaseStudy_tireSize_idx" ON "CaseStudy"("tireSize");
ALTER TABLE "CaseStudy" ADD CONSTRAINT "CaseStudy_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
