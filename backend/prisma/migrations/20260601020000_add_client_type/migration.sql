-- Add missing Client.type column for legacy databases.
ALTER TABLE "Client"
ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'RETAIL';
