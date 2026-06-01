-- Add required and optional Product columns that may be missing in legacy databases.
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "importPrice" double precision NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "sellingPrice" double precision,
  ADD COLUMN IF NOT EXISTS "minStock" integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "maxStock" integer NOT NULL DEFAULT 100;
