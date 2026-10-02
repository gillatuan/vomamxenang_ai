# Legacy Usage Audit — TASK-0003

Date: 2026-10-02
Scope: repository runtime code, frontend API/UI, seed code, Prisma schema and migration history. Production database was not queried or mutated.

## Classification

| Legacy object | Classification | Evidence / interpretation |
| --- | --- | --- |
| Zone | LEGACY-DEAD runtime / MIGRATION-ONLY | Current warehouse runtime uses Location.zone string. No Prisma Zone delegate in current warehouse service. |
| Rack | LEGACY-DEAD runtime / MIGRATION-ONLY | Current warehouse runtime uses Location.rack string. No Prisma Rack delegate in current warehouse service. |
| Slot | LEGACY-DEAD runtime / MIGRATION-ONLY | Current warehouse runtime uses Location.slot string and locationCode. No Prisma Slot delegate in current warehouse service. |
| Receipt | LEGACY-DEAD runtime / MIGRATION-ONLY | Current receipt API is backed by InventoryTransaction(type=IMPORT). |
| ReceiptItem | LEGACY-DEAD runtime / MIGRATION-ONLY | Current receipt lines are TransactionDetail rows. |
| Issue | LEGACY-DEAD runtime / MIGRATION-ONLY | Current issue API is backed by InventoryTransaction(type=EXPORT). |
| IssueItem | LEGACY-DEAD runtime / MIGRATION-ONLY | Current issue lines are TransactionDetail rows. |
| InventoryLog | LEGACY-DEAD runtime / MIGRATION-ONLY | Current inventory logs endpoint reads TransactionDetail + InventoryTransaction. |
| Stock.slotId | LEGACY-DEAD field, but Stock model is ACTIVE | Current schema's Stock uses locationId. CategoryService.getTotalStock still reads prisma.stock; seed.ts still writes prisma.stock using locationId. Therefore Stock cannot be dropped as part of legacy cleanup. |
| Location | ACTIVE | Warehouse service, inventory service, orders, frontend warehouse/stock UI and seeds use Location. |
| StockLocation | ACTIVE / PRIMARY physical stock | Inventory receipt/issue, checkout fulfillment, warehouse scan/map, frontend stock UI and Phase 2 integration tests use StockLocation. |
| InventoryTransaction | ACTIVE | Current receipt/issue workflow. |
| TransactionDetail | ACTIVE | Current transaction lines and inventory log API. |
| AssemblyLog | ACTIVE but missing from migration lineage | Current inventory assembly writes/reads AssemblyLog; safe additive migration candidate. |

## Frontend contract
Current admin warehouse UI consumes Warehouse -> Location with scalar zone/rack/slot fields and StockLocation rows. Current inventory transactions UI consumes InventoryTransaction/TransactionDetail. No active frontend contract requires legacy Zone/Rack/Slot or Receipt/Issue tables.

## Documentation drift
WAREHOUSE_IMPLEMENTATION.md still describes the old hierarchical Zone/Rack/Slot + Receipt/Issue/InventoryLog design in substantial sections, but its later “Recent Implementation Updates” section acknowledges the current Location/StockLocation/InventoryTransaction model. Treat the earlier examples as stale documentation, not runtime evidence.

## Important exception: Stock
The legacy-looking Stock table is not dead. CategoryService.getTotalStock and prisma/seed.ts still use it. Current schema expects Stock.locationId, while historical migrations created Stock.slotId. This is a real data-model migration problem, not a safe DROP.

## Decision from repository evidence
Repository runtime strongly supports the current schema direction for retiring the eight legacy tables, but repository evidence alone cannot prove production rows are disposable. Before any destructive migration, run production read-only preflight counts and relationship/data-mapping queries.

## Safe work that can proceed without production access
1. Add the missing AssemblyLog table/FKs through an additive idempotent migration.
2. Keep the Prisma drift gate.
3. Add a production preflight SQL script that performs SELECT-only counts/null checks/mapping checks for later execution.
4. Do not DROP legacy tables, remove enum values, alter Stock slotId/locationId, force Client.phone NOT NULL, or rewrite numeric/timestamp types yet.
