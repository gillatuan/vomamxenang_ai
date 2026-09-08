ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Normalize Vietnamese titles without requiring the unaccent extension.
CREATE FUNCTION pg_temp.content_slug(value TEXT) RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  SELECT trim(both '-' from left(regexp_replace(translate(lower(value),
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'), '[^a-z0-9]+', '-', 'g'), 120));
$$;
DO $$
DECLARE tbl TEXT; title_col TEXT; row_data RECORD; base TEXT; candidate TEXT; taken BOOLEAN; suffix INTEGER;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['Product', 'Post'] LOOP
    title_col := CASE WHEN tbl = 'Product' THEN 'name' ELSE 'title' END;
    FOR row_data IN EXECUTE format('SELECT id, %I AS title FROM %I WHERE slug IS NULL OR slug = '''' ORDER BY "createdAt", id', title_col, tbl) LOOP
      base := coalesce(nullif(pg_temp.content_slug(row_data.title), ''), 'noi-dung');
      candidate := base; suffix := 2;
      LOOP
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 OR id = $1)', tbl) INTO taken USING candidate;
        EXIT WHEN NOT taken;
        candidate := base || '-' || suffix; suffix := suffix + 1;
      END LOOP;
      EXECUTE format('UPDATE %I SET slug = $1 WHERE id = $2', tbl) USING candidate, row_data.id;
    END LOOP;
    EXECUTE format('UPDATE %I SET seo = coalesce(seo, ''{}''::jsonb) || jsonb_build_object(''canonicalPath'', $1 || slug, ''keywords'', coalesce(seo->''keywords'', to_jsonb(array_prepend(%I, tags))))', tbl, title_col)
      USING CASE WHEN tbl = 'Product' THEN '/products/' ELSE '/blog/' END;
  END LOOP;
END $$;
