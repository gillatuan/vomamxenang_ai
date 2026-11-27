-- Optional sales quote range; historical fixed prices remain unchanged.
ALTER TABLE "Product"
  ADD COLUMN "priceMin" DOUBLE PRECISION,
  ADD COLUMN "priceMax" DOUBLE PRECISION;

-- Avoid invalid ranges regardless of the client used to update Product.
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_price_range_valid"
  CHECK (
    ("priceMin" IS NULL AND "priceMax" IS NULL)
    OR
    ("priceMin" IS NOT NULL AND "priceMax" IS NOT NULL
     AND "priceMin" > 0 AND "priceMax" >= "priceMin")
  );
