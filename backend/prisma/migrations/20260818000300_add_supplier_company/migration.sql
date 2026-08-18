-- Keep legacy local databases compatible with the current Supplier model.
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "company" TEXT;
