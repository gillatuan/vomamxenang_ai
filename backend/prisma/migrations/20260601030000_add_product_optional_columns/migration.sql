-- Add optional Product columns that may be missing in legacy databases.
ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "size" text,
  ADD COLUMN IF NOT EXISTS "brand" text,
  ADD COLUMN IF NOT EXISTS "tireType" text,
  ADD COLUMN IF NOT EXISTS "rimType" text,
  ADD COLUMN IF NOT EXISTS "condition" text,
  ADD COLUMN IF NOT EXISTS "imageUrl" text,
  ADD COLUMN IF NOT EXISTS "description" text;
