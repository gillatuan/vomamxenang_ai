# Production release: PHOENIX seeds 014 and 015

Seeds 014 and 015 are **already committed** to the production seed registry. This workflow runs **only these two releases**, in order: 014 creates or updates four PHOENIX solid-tire listings; 015 adds `VAT_EXCLUDED_INVOICE_AVAILABLE` to the same four records. Neither changes the approved retail prices after creation.

## Before any writes

The four display prices (VND per tire) are 2,690,000 (6.00-9), 3,190,000 (6.50-10), 3,790,000 (7.00-12), and 4,790,000 (28×9-15). **All exclude VAT.** VAT invoices are supported on request; applicable tax and final payable amount must be confirmed with the customer. Seed 014 deliberately does not create stock records and does not provide fabricated product images.

1. Merge the PR and confirm all checks are green.
2. Open GitHub Actions → **Protected production PHOENIX seeds 014 and 015**. Run on `main` with `mode=dry-run` and leave other inputs blank. Confirm DB name `postgres`, matching existing SKU 6.00-9 at the original placeholder price, and pending seeds.
3. Run **Hosted encrypted backup for seed 013** on `main`. Despite the legacy workflow name, it takes a fresh full production database snapshot, verifies isolated application-data restore, and creates an encrypted archive. Download and store the encrypted artifact **outside GitHub** and verify its integrity and decryptability with the private key held offline. Do not reuse an expired/old backup artifact.
4. Run the same PHOENIX workflow with `mode=apply` and enter:
   - `expected_database_name`: `postgres`
   - `backup_run_id`: fresh successful encrypted-backup workflow run ID
   - `backup_sha256`: 64-character encrypted archive SHA-256, verified against your separately saved copy
   - `external_backup_confirmation`: `EXTERNAL-BACKUP-SAVED` (only if truly saved and recoverable)
   - `confirmation`: `APPLY-PHOENIX-014-015-PRODUCTION`

The apply job verifies the previous backup run, checks its encrypted SHA, takes **another fresh backup and isolated restore verification**, validates the production DB identity, and runs just 014/015 in individually transaction-locked, history-guarded releases. A mismatch in the existing 6.00-9 SKU price or any new SKU conflict fails closed instead of changing admin-managed prices. Rerunning after a successful release skips both seeds and checks all four products are published with the VAT tag.

**Do not use** `yarn db:seed:production` for this release: it would consider every pending registry seed. Do not assume merge automatically writes to the production database. Always inspect the final verified-products output.

The workflow intentionally does not create an invoice nor charge VAT: it only clarifies the displayed VAT-excluded price. Confirm the checkout/invoicing tax policy separately before enabling real payment.
