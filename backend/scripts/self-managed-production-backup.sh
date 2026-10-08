#!/usr/bin/env bash
# Fail closed: create, inspect, and durably store a fresh PostgreSQL custom-format backup.
set -Eeuo pipefail
umask 077
: "${DATABASE_URL:?DIRECT_DATABASE_URL is required}"
: "${PRODUCTION_BACKUP_BUCKET:?PRODUCTION_BACKUP_BUCKET is required}"
case "$DATABASE_URL" in postgresql://*|postgres://*) ;; *) echo "::error::A direct PostgreSQL URL is required"; exit 1;; esac
if [[ "$DATABASE_URL" == *"accelerate.prisma-data.net"* ]]; then echo "::error::Accelerate URL is not supported"; exit 1; fi
for cmd in pg_dump pg_restore aws sha256sum; do command -v "$cmd" >/dev/null || { echo "::error::Missing $cmd"; exit 1; }; done
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
archive="$workdir/production.dump"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
run_id="${GITHUB_RUN_ID:-manual}"
key="production/postgres/${timestamp}-${run_id}-${GITHUB_RUN_ATTEMPT:-1}.dump"
echo "Creating read-only consistent PostgreSQL dump"
pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --no-acl --file="$archive"
test -s "$archive" || { echo "::error::Backup archive is empty"; exit 1; }
pg_restore --list "$archive" > "$workdir/toc"
grep -q 'TABLE DATA' "$workdir/toc" || { echo "::error::Backup has no TABLE DATA entries"; exit 1; }
checksum="$(sha256sum "$archive" | awk '{print $1}')"
echo "Uploading encrypted backup to private S3 storage"
aws s3api put-object --bucket "$PRODUCTION_BACKUP_BUCKET" --key "$key" \
  --body "$archive" --server-side-encryption AES256 \
  --metadata "sha256=$checksum" --output json > "$workdir/upload.json"
aws s3api head-object --bucket "$PRODUCTION_BACKUP_BUCKET" --key "$key" > "$workdir/head.json"
node -e '
const fs=require("fs");
const head=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const checksum=process.argv[2];
if(head.ServerSideEncryption!=="AES256" || head.Metadata?.sha256!==checksum || !(head.ContentLength>0)) process.exit(1);
' "$workdir/head.json" "$checksum" || { echo "::error::Stored backup metadata verification failed"; exit 1; }
echo "Self-managed backup gate PASS: S3 object verified, encrypted with SSE-S3, pg_restore TOC readable."
echo "Backup location: s3://$PRODUCTION_BACKUP_BUCKET/$key"
echo "SHA256: $checksum"
echo "::notice::A full test restore into an isolated database is still recommended before high-risk schema changes."
