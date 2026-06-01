-- Drop legacy Product.quantityInStock column that is not part of the current Prisma schema.
ALTER TABLE "Product"
  DROP COLUMN IF EXISTS "quantityInStock";
