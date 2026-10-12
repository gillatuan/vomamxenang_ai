#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
: "${PRODUCTION_DATABASE_URL:?Set PRODUCTION_DATABASE_URL}"
: "${LOCAL_DATABASE_URL:?Set LOCAL_DATABASE_URL}"
[[ "$PRODUCTION_DATABASE_URL" != "$LOCAL_DATABASE_URL" ]] || { echo "Database URLs must differ" >&2; exit 1; }
for cmd in pg_dump pg_restore psql sha256sum; do command -v "$cmd" >/dev/null || exit 1; done
directory="${BACKUP_DIR:-$HOME/vomamxenang-private-backups}/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$directory"
chmod 700 "$directory"
pg_dump --dbname="$PRODUCTION_DATABASE_URL" --schema-only --no-owner --no-acl --file="$directory/production-schema.sql"
pg_dump --dbname="$LOCAL_DATABASE_URL" --schema-only --no-owner --no-acl --file="$directory/local-schema.sql"
diff -u "$directory/local-schema.sql" "$directory/production-schema.sql" > "$directory/schema.diff" || test "$?" -eq 1
pg_dump --dbname="$PRODUCTION_DATABASE_URL" --format=custom --no-owner --no-acl --file="$directory/production.dump"
test -s "$directory/production.dump"
pg_restore --list "$directory/production.dump" > "$directory/restore-toc.txt"
(cd "$directory" && sha256sum production.dump > production.dump.sha256)
echo "Saved private comparison and backup in $directory"
