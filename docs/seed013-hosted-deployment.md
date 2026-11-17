# Seed 013 — GitHub-hosted production release (no self-hosted runner)

This process publishes **only** the warehouse diary posts for 17 and 18 September 2026. It does **not** run `db:seed:production`, apply migrations, or modify unrelated products.

## 1. Dry-run (read-only)

Actions → **Production warehouse diary seed 013** → Run workflow → `dry-run`, on `main`. Leave database name blank. Verify the output identifies `postgres`, seed 013 is pending and post status.

## 2. Create a recoverable backup (read-only)

Actions → **Hosted encrypted backup for seed 013** → Run workflow on `main`. The job:
- Connects through the protected Production environment's `DIRECT_DATABASE_URL`.
- Uses PostgreSQL 18 tools and an isolated PostgreSQL 18 restore database on the hosted runner.
- Checks snapshot-consistent source inventory against the restored inventory.
- Encrypts the backup with `backend/backup-recipient-public.pem`; **the private decryption key must be kept by the owner and tested separately**.
- Uploads only `seed013-production.vmxenc` and `seed013-production.vmxenc.sha256` in a 7-day GitHub Actions artifact.

**Important:** GitHub Actions artifacts are not durable offsite backups. Before proceeding, download the encrypted artifact to storage you control, copy the SHA-256 from its checksum file, and verify that you possess the matching private key and can recover a backup. Never publish the encrypted backup or recovery key publicly. The encrypted artifact contains live production data.

The tool verifies the isolated restore *before encryption*; it does not automatically verify decryption with the owner's private key. Check that separately before approving a production write.

## 3. Apply only after external retention is confirmed

Actions → **Hosted protected apply of warehouse seed 013** → Run workflow on `main`, entering:

| Field | Value |
|---|---|
| `expected_database_name` | `postgres` |
| `backup_run_id` | Run ID of the successful hosted encrypted-backup job |
| `backup_sha256` | Exactly the 64-character SHA-256 for `seed013-production.vmxenc` retained outside GitHub |
| `external_backup_confirmation` | `EXTERNAL-BACKUP-SAVED` |
| `confirmation` | `APPLY-SEED-013-PRODUCTION` |

The workflow checks the successful backup run, downloads the encrypted artifact, validates its hash against the operator-confirmed hash, creates **another fresh backup** and verifies an isolated restore, and only then calls the seed 013 runner. PostgreSQL operations use a transaction and `SeedHistory` guard; it verifies both posts are `PUBLISHED`.

The external-storage confirmation is an **operator attestation**, not remote storage verification. If you have not retained the backup and tested recovery, do **not** use `apply`. No database writes are performed during steps 1–2.

## 4. Post-write check

Look for `executed: ["013-warehouse-day4-day5-posts"]` and both slugs with `PUBLISHED`. If `skipped`, check `SeedHistory` and the posts rather than re-running the entire production seed registry. Images and videos are **not** included in the seed and must be hosted separately; do not commit media to the public GitHub repo.

## Previous queued run

A prior `apply` was queued waiting for `self-hosted, production-db-backup`. Cancel that stale GitHub Actions run manually; the old self-hosted apply path is retired.
