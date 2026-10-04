-- Read-only preflight for recovering 20261004140000_product_category_relation.
-- All three objects must either be absent (safe to mark rolled back and redeploy)
-- or already match the intended migration before marking it applied.
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema='public' AND table_name='Product' AND column_name='categoryId'
) AS category_id_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_indexes
  WHERE schemaname='public' AND tablename='Product' AND indexname='Product_categoryId_idx'
) AS category_index_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_constraint
  WHERE conname='Product_categoryId_fkey'
    AND conrelid='"Product"'::regclass
) AS category_fk_exists;
