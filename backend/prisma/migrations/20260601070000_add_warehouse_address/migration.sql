-- Add missing Warehouse.address column for legacy databases.
ALTER TABLE "Warehouse"
  ADD COLUMN IF NOT EXISTS "address" text;
