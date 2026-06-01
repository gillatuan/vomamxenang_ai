-- Create Role enum if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('ADMIN_MANAGER', 'STOREKEEPER');
  END IF;
END$$;

-- Convert existing User.role text values to Role enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'role' AND data_type = 'text'
  ) THEN
    UPDATE "User"
    SET "role" = CASE
      WHEN "role" = 'ADMIN' THEN 'ADMIN_MANAGER'
      ELSE "role"
    END
    WHERE "role" IS NOT NULL;

    ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STOREKEEPER';
  END IF;
END$$;

-- Ensure createdAt and updatedAt columns have a default value if missing
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('createdAt', 'updatedAt')
      AND data_type IN ('timestamp without time zone', 'timestamp with time zone')
      AND column_default IS NULL
  LOOP
    EXECUTE format('ALTER TABLE "%I" ALTER COLUMN "%I" SET DEFAULT now()', rec.table_name, rec.column_name);
  END LOOP;
END$$;

-- Add missing Order.code column if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Order' AND column_name = 'code'
  ) THEN
    ALTER TABLE "Order" ADD COLUMN "code" TEXT NOT NULL DEFAULT md5(random()::text || clock_timestamp()::text);
    UPDATE "Order" SET "code" = 'ORDER-' || "id" WHERE "code" IS NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_code_key" ON "Order" ("code");
  END IF;
END$$;

-- Add missing Product.sku column if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'sku'
  ) THEN
    ALTER TABLE "Product" ADD COLUMN "sku" TEXT;
    UPDATE "Product" SET "sku" = 'SKU:' || "id" WHERE "sku" IS NULL;
    ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product" ("sku");
  END IF;
END$$;
