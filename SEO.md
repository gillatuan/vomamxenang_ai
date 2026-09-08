# Product and post SEO

Public URLs use `/products/{slug}` and `/blog/{slug}`. New content gets a Vietnamese title/name based alias automatically; duplicate generated aliases receive `-2`, `-3`, etc. Editors can change the alias in **SEO & đường dẫn**. Explicit duplicates are rejected. Renaming a title alone keeps its existing alias.

Old IDs and alias history continue resolving to the same published record, and the frontend permanently redirects them (HTTP 308) to the current URL. Drafts and missing content return 404. API mutations and cart identities continue using the database ID.

The detail pages render their content on the server, with generated metadata, current canonical URL, H1 and Product/BlogPosting JSON-LD. Sitemap entries use aliases. Internal links are refreshed to current aliases and inserted only for phrases already in the description; existing links and code are preserved, with at most five related destinations. The editor also lets users choose a published product/post directly from the link dialog.

## Database rollout

Deploy the backend migration before serving the updated application:

```sh
cd backend
yarn prisma:migrate
yarn build
```

The migration backfills missing aliases and default SEO keywords for existing records. It preserves existing aliases, content and SEO settings, except canonical paths which follow the current alias.

For the local database, the SEO maintenance script previews changes by default and refuses remote database hosts unless `--production` is explicitly set. It uses frontend rich-text helpers, so install frontend dependencies first:

```sh
cd backend
node scripts/optimize-content-seo.cjs
node scripts/optimize-content-seo.cjs --apply
```

Local data was updated for 17 products and 5 posts; 20 descriptions received contextual links. The script includes editorial keyword phrases for the five existing articles, and a repeated run makes no further changes.

## Verification

```sh
cd frontend
node --test tests/*.test.cjs
# With frontend :3000 and backend :3001 running:
node tests/seo-http.cjs
```

```sh
cd backend
# Creates temporary local fixtures and removes them afterwards:
./node_modules/.bin/ts-node --transpile-only test/content-alias.spec.ts
```

Production content sync uses the production environment and requires a new backup file before applying changes:

```sh
cd backend
APP_ENV=production node scripts/optimize-content-seo.cjs --production
APP_ENV=production SEO_BACKUP_FILE=/secure/path/content-backup.json node scripts/optimize-content-seo.cjs --production --apply
```

The sync enriches current production content; it does not copy local inventory, accounts or orders.
