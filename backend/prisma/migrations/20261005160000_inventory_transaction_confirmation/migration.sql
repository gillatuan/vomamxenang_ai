CREATE TYPE "InventoryTransactionStatus" AS ENUM ('DRAFT', 'CONFIRMED');
ALTER TABLE "InventoryTransaction" ADD COLUMN "status" "InventoryTransactionStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "InventoryTransaction" ADD COLUMN "confirmedAt" TIMESTAMP(3);
