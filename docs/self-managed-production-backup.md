# Self-managed backup setup (Prisma Free)

The production migration workflow must fail closed until an encrypted offsite PostgreSQL dump is verified.

Configure GitHub **Production** environment:
- Secret: `DIRECT_DATABASE_URL` (direct PostgreSQL connection, least privilege for dump and migration)
- Secret: `PRODUCTION_BACKUP_AWS_ROLE_ARN` (AWS OIDC role scoped to one private backup bucket)
- Variable: `PRODUCTION_BACKUP_AWS_REGION`
- Variable: `PRODUCTION_BACKUP_BUCKET`
- Variable: `PRODUCTION_BACKUP_KMS_KEY_ID`

S3 bucket: block public access, enable versioning, apply retention/object-lock policy, restrict read/delete, use SSE-KMS and scoped KMS permissions. Never upload dumps as GitHub Actions artifacts or commit them.

Run the backup script only after configuring these resources. It checks a custom-format dump with `pg_restore --list`, stores it with KMS encryption and verifies object metadata. A restore drill to an isolated temporary PostgreSQL instance is recommended to prove restorability.

**Important:** The existing migration workflow still uses provider-managed backup verification until its workflow changes are reviewed and merged. Never bypass that gate to run migrations. The new script by itself does not authorize production migration.
