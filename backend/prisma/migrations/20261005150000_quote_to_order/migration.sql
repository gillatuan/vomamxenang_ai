ALTER TABLE "SalesQuote" ADD COLUMN "orderId" TEXT;
ALTER TABLE "SalesQuote" ADD COLUMN "convertedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "SalesQuote_orderId_key" ON "SalesQuote"("orderId");

ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
