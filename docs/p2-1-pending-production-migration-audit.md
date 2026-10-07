# P2.1 production pending migration audit

Audited in production order after the read-only preflight. This document does not authorize deployment.

| Migration | Classification | Verdict |
|---|---|---|
| 20261005080000_add_quote_leads | additive enum/table/index/FK | PASS |
| 20261005090000_store_info_local_seo | three nullable columns | PASS |
| 20261005100000_add_case_studies | additive table/index/FK | PASS |
| 20261005110000_add_conversion_events | additive enum/table/index/FK | PASS |
| 20261005130000_lead_crm | nullable columns + new activity table/index/FKs | PASS |
| 20261005140000_sales_quotes | additive enum/tables/indexes/FKs | PASS |
| 20261005150000_quote_to_order | nullable columns + unique index + FK | PASS |
| 20261005160000_inventory_transaction_confirmation | enum + NOT NULL status DEFAULT DRAFT + nullable timestamp | PASS WITH NOTE |
| 20261005170000_order_fulfillment | nullable orderId + unique index + FK | PASS |
| 20261005180000_order_payments | additive enum/table/indexes/FKs | PASS |
| 20261005190000_receivables_aging | nullable column + index | PASS WITH LOCK NOTE |
| 20261006073000_add_stock_reservations | additive enum/table/indexes/FKs/checks | PASS FOR DEPLOY; FOLLOW-UP REQUIRED |
| 20261006074500_add_reservation_expiry | nullable column + index | PASS |

All 13 migrations are additive. None contains DROP, DELETE, TRUNCATE, destructive type conversion, column rename, or an explicit data rewrite/backfill.

20261005160000 classifies every pre-existing InventoryTransaction as DRAFT. This is data-preserving and conservative, but historical records may require a later explicit business backfill after review.

20261005190000 creates an index on the existing Order table; ordinary PostgreSQL CREATE INDEX can hold locks while building it. Schedule migration execution with production traffic/size in mind.

20261006073000 has a known PostgreSQL NULL-uniqueness limitation: UNIQUE(orderId, productId, wheelRimId, locationId) does not enforce logical uniqueness when one nullable item id is NULL. Current runtime serialization/locking remains the primary concurrency protection. Do not introduce an extra schema migration inside this production gate; track a corrective constraint/index separately.

## Production gate before execution

1. Confirm backup/restore readiness.
2. Re-run the read-only production migration preflight against feature/p2-1-stock-lifecycle immediately before execution.
3. Execute migrations through a separate protected production workflow with the dedicated migration credential.
4. Verify migration status and schema drift after execution.
5. Only then merge/promote P2.1 application code to main and monitor production smoke/deploy.
