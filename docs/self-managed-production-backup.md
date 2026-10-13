# Self-managed production backup

The canonical operator guide is [db-audit-backup.md](db-audit-backup.md).

`backend/scripts/self-managed-production-backup.sh` is now a compatibility entry point for the snapshot-consistent P1 audit/backup/restore implementation. Existing `PG_BIN_DIR` is added to PATH and `PRODUCTION_BACKUP_DIR` maps to `BACKUP_DIR`. The directory must now be private and outside the repository. The old `.private/production-backups` default and `KEEP_TEMP_RESTORE_DATABASE` behavior are retired. The script derives the temporary name from the restore URL, refuses existing targets, and always cleans up only the database created by that invocation.

No AWS/S3 or paid Prisma backup plan is required. A durable private backup directory is still needed; a hosted runner's ephemeral disk is not durable retention.
