CREATE TYPE "ConversionEventType" AS ENUM ('VIEW_SIZE','VIEW_PRODUCT','CLICK_PHONE','CLICK_ZALO','OPEN_QUOTE','SUBMIT_QUOTE');
CREATE TABLE "ConversionEvent" (
 "id" TEXT NOT NULL,
 "type" "ConversionEventType" NOT NULL,
 "path" TEXT NOT NULL,
 "productId" TEXT,
 "context" TEXT,
 "sessionId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ConversionEvent_type_createdAt_idx" ON "ConversionEvent"("type","createdAt");
CREATE INDEX "ConversionEvent_path_createdAt_idx" ON "ConversionEvent"("path","createdAt");
CREATE INDEX "ConversionEvent_productId_idx" ON "ConversionEvent"("productId");
ALTER TABLE "ConversionEvent" ADD CONSTRAINT "ConversionEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
