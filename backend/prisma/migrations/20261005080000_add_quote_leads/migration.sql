CREATE TYPE "QuoteLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST');

CREATE TABLE "QuoteLead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "zalo" TEXT,
  "company" TEXT,
  "quantity" INTEGER,
  "forkliftModel" TEXT,
  "location" TEXT,
  "note" TEXT,
  "imageUrl" TEXT,
  "source" TEXT NOT NULL DEFAULT 'WEBSITE',
  "landingPage" TEXT,
  "productId" TEXT,
  "status" "QuoteLeadStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuoteLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QuoteLead_status_createdAt_idx" ON "QuoteLead"("status", "createdAt");
CREATE INDEX "QuoteLead_productId_idx" ON "QuoteLead"("productId");
ALTER TABLE "QuoteLead" ADD CONSTRAINT "QuoteLead_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
