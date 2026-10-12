# P1 local/production database audit and backup

Run from a trusted operator machine with PostgreSQL client tools installed. Supply `PRODUCTION_DATABASE_URL` and `LOCAL_DATABASE_URL` as direct PostgreSQL URLs via private environment configuration. Never commit credentials.

```bash
cd backend
bash scripts/db-audit-backup.sh
```

The script compares schema-only dumps, saves a private custom-format production backup, writes SHA256 and checks archive TOC. It does not mutate either database. Backups are written outside the repository to `~/vomamxenang-private-backups` by default.

**Limitations:** Schema diffs may contain environment-specific metadata. A successful archive listing does not prove restore. Before production migrations, restore into an isolated empty PostgreSQL database and verify application-critical tables, row counts, and migration ledger. The existing provider-managed migration gate remains in force until a safe replacement is reviewed and deployed. Never upload production dumps to GitHub artifacts.
