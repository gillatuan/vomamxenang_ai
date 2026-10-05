CREATE TYPE "SalesQuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

CREATE TABLE "SalesQuote" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "leadId" TEXT,
  "clientId" TEXT,
  "createdById" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "company" TEXT,
  "status" "SalesQuoteStatus" NOT NULL DEFAULT 'DRAFT',
  "subtotal" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "note" TEXT,
  "validUntil" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesQuote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesQuoteItem" (
  "id" TEXT NOT NULL,
  "salesQuoteId" TEXT NOT NULL,
  "productId" TEXT,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "lineTotal" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "SalesQuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SalesQuote_code_key" ON "SalesQuote"("code");
CREATE INDEX "SalesQuote_status_createdAt_idx" ON "SalesQuote"("status", "createdAt");
CREATE INDEX "SalesQuote_leadId_createdAt_idx" ON "SalesQuote"("leadId", "createdAt");
CREATE INDEX "SalesQuote_clientId_createdAt_idx" ON "SalesQuote"("clientId", "createdAt");
CREATE INDEX "SalesQuoteItem_salesQuoteId_idx" ON "SalesQuoteItem"("salesQuoteId");
CREATE INDEX "SalesQuoteItem_productId_idx" ON "SalesQuoteItem"("productId");

ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "QuoteLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteItem" ADD CONSTRAINT "SalesQuoteItem_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteItem" ADD CONSTRAINT "SalesQuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
