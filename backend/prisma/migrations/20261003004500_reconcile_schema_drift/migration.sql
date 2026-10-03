-- TASK-0003 Phase 3 repair migration.
-- Canonical target: backend/prisma/schema.prisma.
-- IMPORTANT: destructive migration. Production execution requires separate human approval.
-- Production read-only preflight #37082412844 verified:
--   legacy tables = 0 rows, Stock = 0 rows, Client.phone NULL = 0, RimType rows = 0.

-- Fail closed if assumptions no longer hold at execution time.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "InventoryLog" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "Issue" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "IssueItem" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "Rack" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "Receipt" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "ReceiptItem" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "Slot" LIMIT 1)
     OR EXISTS (SELECT 1 FROM "Zone" LIMIT 1) THEN
    RAISE EXCEPTION 'TASK-0003 safety gate: legacy tables are no longer empty';
  END IF;
  IF EXISTS (SELECT 1 FROM "Stock" LIMIT 1) THEN
    RAISE EXCEPTION 'TASK-0003 safety gate: Stock is no longer empty; location backfill required';
  END IF;
  IF EXISTS (SELECT 1 FROM "Client" WHERE "phone" IS NULL LIMIT 1) THEN
    RAISE EXCEPTION 'TASK-0003 safety gate: Client.phone contains NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM "Category" WHERE "rimType"::text = 'LIP_CLICK' LIMIT 1) THEN
    RAISE EXCEPTION 'TASK-0003 safety gate: LIP_CLICK data requires explicit semantic mapping';
  END IF;
END $$;

-- Retire legacy warehouse/receipt/issue model.
DROP TABLE "InventoryLog";
DROP TABLE "IssueItem";
DROP TABLE "Issue";
DROP TABLE "ReceiptItem";
DROP TABLE "Receipt";
DROP TABLE "Stock" CASCADE;
DROP TABLE "Slot";
DROP TABLE "Rack";
DROP TABLE "Zone";

DROP TYPE "InventoryLogType";
DROP TYPE "IssueStatus";
DROP TYPE "ReceiptStatus";

-- Reconcile RimType without silently mapping the retired LIP_CLICK semantic.
ALTER TYPE "RimType" RENAME TO "RimType_old";
CREATE TYPE "RimType" AS ENUM ('LIP', 'CLICK', 'STANDARD');
ALTER TABLE "Category"
  ALTER COLUMN "rimType" TYPE "RimType"
  USING ("rimType"::text::"RimType");
DROP TYPE "RimType_old";

-- Recreate canonical Stock model (preflight proves legacy Stock has no production rows).
CREATE TABLE "Stock" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Stock_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Stock_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Stock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Remove legacy columns and indexes absent from the canonical Prisma schema.
DROP INDEX IF EXISTS "Category_name_key";
DROP INDEX IF EXISTS "Category_name_tireSize_brand_tireType_rimType_condition_key";
ALTER TABLE "Category" DROP COLUMN "updatedAt";
ALTER TABLE "Client" DROP COLUMN "updatedAt", ALTER COLUMN "phone" SET NOT NULL;
ALTER TABLE "Order" DROP COLUMN "updatedAt";
ALTER TABLE "Post" DROP COLUMN "published", DROP COLUMN "updatedAt";
ALTER TABLE "Product" DROP COLUMN "updatedAt";
ALTER TABLE "Supplier" DROP COLUMN "updatedAt";
ALTER TABLE "User" DROP COLUMN "updatedAt";
ALTER TABLE "Warehouse" DROP COLUMN "createdAt", DROP COLUMN "updatedAt";

DROP INDEX IF EXISTS "FavouriteProduct_userId_idx";
DROP INDEX IF EXISTS "OrderItem_locationId_idx";
DROP INDEX IF EXISTS "OrderItem_orderId_idx";
DROP INDEX IF EXISTS "PostComment_postId_idx";
DROP INDEX IF EXISTS "PostComment_userId_idx";
DROP INDEX IF EXISTS "ProductComment_productId_idx";
DROP INDEX IF EXISTS "ProductComment_userId_idx";
DROP INDEX IF EXISTS "TransactionDetail_locationId_idx";
DROP INDEX IF EXISTS "TransactionDetail_txId_idx";

-- Prisma-side UUID defaults are client-generated; remove database defaults.
ALTER TABLE "FavouriteProduct" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "PostComment" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "ProductComment" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "PriceMatrix" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "code" DROP DEFAULT;

-- Scalar/type/default reconciliation.
ALTER TABLE "Order" ALTER COLUMN "totalAmount" TYPE DOUBLE PRECISION USING "totalAmount"::DOUBLE PRECISION;
ALTER TABLE "Product"
  ALTER COLUMN "type" SET DEFAULT 'TIRE',
  ALTER COLUMN "importPrice" TYPE DOUBLE PRECISION USING "importPrice"::DOUBLE PRECISION,
  ALTER COLUMN "sellingPrice" TYPE DOUBLE PRECISION USING "sellingPrice"::DOUBLE PRECISION;
ALTER TABLE "Location" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3) USING "createdAt"::TIMESTAMP(3);
ALTER TABLE "WheelRim" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3) USING "createdAt"::TIMESTAMP(3);

-- Match relation referential actions declared by Prisma.
ALTER TABLE "Location" DROP CONSTRAINT "Location_warehouseId_fkey";
ALTER TABLE "Location" ADD CONSTRAINT "Location_warehouseId_fkey"
  FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PriceMatrix" DROP CONSTRAINT "PriceMatrix_productId_fkey";
ALTER TABLE "PriceMatrix" ADD CONSTRAINT "PriceMatrix_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockLocation" DROP CONSTRAINT "StockLocation_locationId_fkey";
ALTER TABLE "StockLocation" DROP CONSTRAINT "StockLocation_productId_fkey";
ALTER TABLE "StockLocation" DROP CONSTRAINT "StockLocation_wheelRimId_fkey";
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_wheelRimId_fkey"
  FOREIGN KEY ("wheelRimId") REFERENCES "WheelRim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Canonical Prisma index names.
ALTER INDEX "PriceMatrix_product_customer_unique" RENAME TO "PriceMatrix_productId_customerType_key";
ALTER INDEX "StockLocation_location_product_wheel_unique" RENAME TO "StockLocation_locationId_productId_wheelRimId_key";
