# AWS Free Tier-oriented production backup setup

Use S3 **SSE-S3 (AES256)**, not a customer-managed KMS key. SSE-S3 avoids the fixed monthly customer-managed KMS key charge. S3 usage can still incur charges depending on account eligibility, storage and requests.

## AWS console configuration

1. Create a private S3 bucket in the closest appropriate region; block all public access, enable bucket versioning and default SSE-S3 encryption.
2. Add a lifecycle expiration rule appropriate to the recovery requirement (for example, 7 days). Estimate storage and request charges; configure AWS Budgets alerts.
3. Create an AWS IAM OIDC identity provider for `https://token.actions.githubusercontent.com` (audience `sts.amazonaws.com`).
4. Create a role trusted **only** by the repository GitHub Actions `Production` environment subject `repo:gillatuan/vomamxenang_ai:environment:Production`, and audience `sts.amazonaws.com`. Scope S3 permissions to `production/postgres/*` in this bucket. Permit PutObject, GetObject and HeadObject; do not grant DeleteObject or wildcard administrator permissions.
5. Set GitHub Production environment secret `PRODUCTION_BACKUP_AWS_ROLE_ARN`, variable `PRODUCTION_BACKUP_AWS_REGION`, variable `PRODUCTION_BACKUP_BUCKET`, and secret `DIRECT_DATABASE_URL`. Never commit credentials.

## Verification

Run the backup script using the AWS OIDC credentials in a protected GitHub Actions job. Verify `pg_restore --list` and S3 object encryption/checksum metadata. **A full restore drill into an isolated temporary PostgreSQL instance is required to establish actual restorability**, and must not target production. The backup gate must fail closed if any check fails.

## Status

The script exists on the feature branch. The migration workflow integration and live AWS/restore verification are pending; do not merge or run migrations until complete.
