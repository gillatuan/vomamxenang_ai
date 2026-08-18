-- Some legacy production databases were marked as migrated before inventory
-- transaction tables were created. Keep this repair idempotent so it is safe
-- for both complete and partial schemas.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType') THEN
    CREATE TYPE "TransactionType" AS ENUM ('IMPORT', 'EXPORT', 'ASSEMBLY_OUT', 'ASSEMBLY_IN');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "InventoryTransaction" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "partnerName" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InventoryTransaction_code_key" ON "InventoryTransaction"("code");

CREATE TABLE IF NOT EXISTS "TransactionDetail" (
  "id" TEXT NOT NULL,
  "txId" TEXT NOT NULL,
  "productId" TEXT,
  "wheelRimId" TEXT,
  "locationId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "TransactionDetail_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TransactionDetail_txId_fkey" FOREIGN KEY ("txId") REFERENCES "InventoryTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "TransactionDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TransactionDetail_wheelRimId_fkey" FOREIGN KEY ("wheelRimId") REFERENCES "WheelRim"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TransactionDetail_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TransactionDetail_txId_idx" ON "TransactionDetail"("txId");
CREATE INDEX IF NOT EXISTS "TransactionDetail_locationId_idx" ON "TransactionDetail"("locationId");
