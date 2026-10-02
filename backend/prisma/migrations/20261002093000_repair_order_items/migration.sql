-- Repair schema drift: OrderItem exists in Prisma schema/application code but was
-- never created by the historical migration chain. This migration is additive
-- and idempotent so existing production databases that already have the table
-- are left unchanged.

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "wheelRimId" TEXT,
  "locationId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_wheelRimId_fkey" FOREIGN KEY ("wheelRimId") REFERENCES "WheelRim"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_locationId_idx" ON "OrderItem"("locationId");
