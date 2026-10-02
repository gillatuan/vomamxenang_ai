-- TASK-0003 PRODUCTION PREFLIGHT — READ ONLY
-- This script contains SELECT statements only. It does not migrate or mutate data.

-- 1. Row counts for objects current Prisma schema would retire.
SELECT 'InventoryLog' AS object, count(*) AS rows FROM "InventoryLog"
UNION ALL SELECT 'Issue', count(*) FROM "Issue"
UNION ALL SELECT 'IssueItem', count(*) FROM "IssueItem"
UNION ALL SELECT 'Rack', count(*) FROM "Rack"
UNION ALL SELECT 'Receipt', count(*) FROM "Receipt"
UNION ALL SELECT 'ReceiptItem', count(*) FROM "ReceiptItem"
UNION ALL SELECT 'Slot', count(*) FROM "Slot"
UNION ALL SELECT 'Zone', count(*) FROM "Zone";

-- 2. Stock migration risk: current migration lineage has slotId while Prisma expects locationId.
SELECT count(*) AS stock_rows,
       count(*) FILTER (WHERE "slotId" IS NULL) AS stock_without_slot
FROM "Stock";

-- 3. Can each legacy Stock.slotId be mapped to the old hierarchy?
SELECT s.id AS stock_id, s."slotId", sl.id AS matched_slot,
       r.id AS rack_id, z.id AS zone_id, w.id AS warehouse_id
FROM "Stock" s
LEFT JOIN "Slot" sl ON sl.id = s."slotId"
LEFT JOIN "Rack" r ON r.id = sl."rackId"
LEFT JOIN "Zone" z ON z.id = r."zoneId"
LEFT JOIN "Warehouse" w ON w.id = z."warehouseId"
WHERE s."slotId" IS NULL OR sl.id IS NULL OR r.id IS NULL OR z.id IS NULL OR w.id IS NULL;

-- 4. Client.phone cannot safely become required if null rows exist.
SELECT count(*) AS clients_with_null_phone FROM "Client" WHERE phone IS NULL;

-- 5. RimType data that would be affected by LIP_CLICK -> LIP/CLICK semantic split.
SELECT "rimType", count(*) AS rows FROM "Category" GROUP BY "rimType" ORDER BY "rimType";

-- 6. Detect whether current Location records can be deterministically matched to legacy hierarchy
-- using warehouse + scalar zone/rack/slot codes. Non-1 match counts require manual mapping.
SELECT l.id AS location_id, l."locationCode", count(sl.id) AS legacy_slot_matches
FROM "Location" l
LEFT JOIN "Zone" z ON z."warehouseId" = l."warehouseId" AND z.code = l.zone
LEFT JOIN "Rack" r ON r."zoneId" = z.id AND r.code = l.rack
LEFT JOIN "Slot" sl ON sl."rackId" = r.id AND sl.code = l.slot
GROUP BY l.id, l."locationCode"
HAVING count(sl.id) <> 1
ORDER BY l."locationCode";
