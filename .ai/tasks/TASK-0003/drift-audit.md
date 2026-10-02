# Prisma Drift Audit — TASK-0003

Date: 2026-10-02
RED evidence: GitHub Actions #84
Head: 1ce57303cf0411beb44eb21b32d02808a3d7753f

## Result
BLOCKED — fresh migration replay succeeds, but Prisma migrate diff exits 2 with substantial schema drift.

## Missing from migrated database (safe/additive candidate)
- AssemblyLog table and its Product/WheelRim foreign keys.

## Legacy objects present in migration database but absent from Prisma schema (destructive to reconcile)
Enums:
- InventoryLogType
- IssueStatus
- ReceiptStatus

Tables:
- InventoryLog
- Issue
- IssueItem
- Rack
- Receipt
- ReceiptItem
- Slot
- Zone

These require DROP operations if schema.prisma remains source of truth. No DROP is authorized in TASK-0003.

## Semantic/type drift requiring explicit data plan
- RimType: migration has LIP_CLICK; schema expects LIP and CLICK.
- Client.phone: nullable in migrated DB, required in Prisma schema.
- Stock: migration uses slotId; schema expects locationId. Reconciliation removes slotId and adds locationId.
- Order.totalAmount: type differs.
- Product.importPrice and Product.sellingPrice: types differ.
- Location.createdAt and WheelRim.createdAt: timestamp types differ.

## Columns Prisma expects removed
- Category.updatedAt
- Client.updatedAt
- Order.updatedAt
- Post.published
- Post.updatedAt
- Product.updatedAt
- Stock.updatedAt
- Supplier.updatedAt
- User.updatedAt
- Warehouse.createdAt
- Warehouse.updatedAt

Removing populated columns is destructive and requires approval/data validation.

## Constraint/index/default drift
Prisma also reports index/FK/default/name differences across Category, FavouriteProduct, OrderItem, PostComment, PriceMatrix, ProductComment, StockLocation, TransactionDetail and legacy warehouse tables. Some are harmless naming/default differences; others require dropping existing indexes/FKs to reach exact Prisma equivalence.

## Architecture decision
Do NOT generate/apply a blanket Prisma diff SQL migration. It would include destructive operations whose production data impact is unknown.

Before GREEN repair, human decision is required on the intended canonical model:
A. Current schema.prisma is authoritative and legacy warehouse/receipt/issue structures should be retired/migrated.
B. Legacy structures are still required and schema.prisma must be expanded/reconciled instead of dropping them.

After that decision, create a data-preserving migration plan with production preflight queries/backfills before any destructive migration.
