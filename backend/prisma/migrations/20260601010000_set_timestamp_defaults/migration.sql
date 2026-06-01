-- Set default now() for createdAt and updatedAt columns missing a default value.
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
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT now()', rec.table_name, rec.column_name);
  END LOOP;
END$$;
