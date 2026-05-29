# Warehouse Management System - Implementation Guide

## Overview
This document provides a comprehensive guide to the warehouse management system implementation for the forklift tyres (Vỏ Xe Nâng) business.

## 📊 Database Schema

### Core Models

#### 1. **Category** (Phân loại vỏ xe)
Manages tire specifications and attributes:
- `name`: Unique category name
- `tireSize`: Size specification (e.g., "6.00-9", "7.00-12", "21x8-9")
- `brand`: Tire brand (e.g., "Bridgestone", "Michelin", "Dunlop")
- `tireType`: SOLID, PNEUMATIC, NON_MARKING
- `rimType`: STANDARD, LIP_CLICK
- `origin`: Country/region of origin
- `condition`: NEW, USED
- `specifications`: Additional technical details

**Relations:**
- `stocks[]`: One-to-many with Stock
- `receiptItems[]`: One-to-many with ReceiptItem
- `issueItems[]`: One-to-many with IssueItem

---

#### 2. **Warehouse Location Management**
Hierarchical warehouse structure: Warehouse → Zone → Rack → Slot

**Warehouse (Kho)**
- `code`: Unique identifier (e.g., "K1")
- `name`: Display name
- `zones[]`: Collection of zones

**Zone (Dãy/Khu vực)**
- `warehouseId`: Parent warehouse
- `code`: Zone code (e.g., "A2")
- `name`: Zone display name
- `racks[]`: Collection of racks

**Rack (Kệ/Hàng)**
- `zoneId`: Parent zone
- `code`: Rack code (e.g., "R3")
- `name`: Rack display name
- `slots[]`: Collection of slots

**Slot (Tầng/Ô)**
- `rackId`: Parent rack
- `code`: Slot code (e.g., "L1" for Level 1)
- `name`: Slot display name
- `barcode`: Optional barcode/QR code for scanning
- `stocks[]`: Inventory at this location

**Location Code Format:** `K1-A2-R3-L1` (Warehouse-Zone-Rack-Slot)

---

#### 3. **Stock (Tồn kho theo vị trí)**
Tracks inventory at specific locations:
- `categoryId`: Reference to Category
- `slotId`: Reference to Slot
- `quantity`: Current stock quantity
- **Unique constraint:** `(categoryId, slotId)` - ensures one inventory record per location per product

---

#### 4. **Receipt (Phiếu Nhập Kho)**
Goods receipt management:
- `code`: Unique receipt number (auto-generated: `RCPT-${timestamp}`)
- `supplierId`: Reference to Supplier
- `status`: DRAFT, CONFIRMED, COMPLETED
- `notes`: Additional notes
- `items[]`: Array of ReceiptItem
- `confirmedAt`: Timestamp when receipt was confirmed

**ReceiptItem:**
- `categoryId`: Tire category
- `quantity`: Quantity received
- `unitPrice`: Import price
- `slotId`: Target storage location
- `notes`: Item-specific notes

---

#### 5. **Issue (Phiếu Xuất Kho)**
Goods issue/outbound management:
- `code`: Unique issue number (auto-generated: `ISS-${timestamp}`)
- `clientId`: Optional reference to Client
- `status`: DRAFT, CONFIRMED, COMPLETED
- `reason`: Reason for issue (e.g., "Sale", "Internal Use")
- `notes`: Additional notes
- `items[]`: Array of IssueItem
- `confirmedAt`: Timestamp when issue was confirmed

**IssueItem:**
- `categoryId`: Tire category
- `quantity`: Quantity issued
- `slotId`: Source storage location
- `notes`: Item-specific notes

---

#### 6. **InventoryLog (Lịch sử nhập xuất)**
Audit trail for all inventory movements:
- `logType`: RECEIPT, ISSUE, ADJUSTMENT, TRANSFER
- `categoryId`: Product category
- `slotId`: Storage location
- `quantity`: Positive for receipts, negative for issues
- `receiptId`: Link to source receipt (if applicable)
- `issueId`: Link to source issue (if applicable)
- `notes`: Log notes
- `createdAt`: Timestamp

---

## 🔌 API Endpoints

### Category Management (`/categories`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Create new tire category |
| GET | `/categories` | List all categories with stock details |
| GET | `/categories/:id` | Get category details with stock locations |
| GET | `/categories/search?q=query` | Search by tire size, brand, or name |
| GET | `/categories/:id/total-stock` | Get total stock across all locations |
| PATCH | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Warehouse Management (`/warehouse`)

#### Warehouse Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/warehouse` | Create new warehouse |
| GET | `/warehouse` | List all warehouses with full structure |
| GET | `/warehouse/:id` | Get warehouse details |
| GET | `/warehouse/:id/structure` | Get complete warehouse hierarchy |

#### Zone Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/warehouse/zones` | Create new zone |
| GET | `/warehouse/zones/list?warehouseId=id` | List zones (filtered by warehouse) |
| GET | `/warehouse/zones/:id` | Get zone details with racks |

#### Rack Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/warehouse/racks` | Create new rack |
| GET | `/warehouse/racks/list?zoneId=id` | List racks (filtered by zone) |
| GET | `/warehouse/racks/:id` | Get rack details with slots |

#### Slot Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/warehouse/slots` | Create new slot |
| GET | `/warehouse/slots/list?rackId=id` | List slots (filtered by rack) |
| GET | `/warehouse/slots/:id` | Get slot details with stock |
| GET | `/warehouse/slots/barcode/:barcode` | Find slot by barcode |
| GET | `/warehouse/slots/:id/location-code` | Get formatted location code |

### Supplier Management (`/suppliers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/suppliers` | Create new supplier |
| GET | `/suppliers` | List all suppliers with receipts |
| GET | `/suppliers/:id` | Get supplier details |
| PATCH | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |

### Inventory Management (`/inventory`)

#### Receipt (Nhập Kho)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/receipts` | Create goods receipt (DRAFT) |
| GET | `/inventory/receipts` | List all receipts |
| GET | `/inventory/receipts/:id` | Get receipt details |
| PATCH | `/inventory/receipts/:id/confirm` | Confirm receipt & update stock |

#### Issue (Xuất Kho)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/issues` | Create goods issue (DRAFT) |
| GET | `/inventory/issues` | List all issues |
| GET | `/inventory/issues/:id` | Get issue details |
| PATCH | `/inventory/issues/:id/confirm` | Confirm issue & reduce stock |

#### Inventory Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/logs` | Get all inventory transactions |
| GET | `/inventory/logs/category/:categoryId` | Get logs for category |
| GET | `/inventory/logs/slot/:slotId` | Get logs for slot |

#### Stock Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/stocks/summary` | Get all stock with locations |
| GET | `/inventory/stocks/category/:categoryId` | Get category stock across locations |
| GET | `/inventory/stocks/slot/:slotId` | Get all items at slot |

---

## ✅ Recent Implementation Updates
This section documents the actual backend changes that were made so you can verify them step by step.

### 1. Prisma schema and generated client
- `backend/prisma/schema.prisma` was kept aligned with current models for:
  - `User`, `Client`, `Supplier`, `Category`, `Product`, `WheelRim`, `Warehouse`, `Location`, `StockLocation`, `Order`, `OrderItem`, `InventoryTransaction`, `Stock`, `TransactionDetail`, `AssemblyLog`, `Post`
- Prisma client was regenerated successfully with:
  - `npm run prisma:generate`
- Build verification was done with:
  - `npm run build`

### 2. Fixed auth role typing
- File: `src/auth/auth.service.ts`
- Change: added a `Role` type guard so `role` is validated as `Role` before passing to Prisma.
- Verify: register endpoint now accepts only `ADMIN_MANAGER` or `STOREKEEPER` and compiles cleanly.

### 3. Fixed category stock relation includes
- File: `src/category/category.service.ts`
- Change: corrected the Prisma `include` chain to use `stocks -> location -> warehouse` instead of invalid `slot` nesting.
- Verify: category list/detail queries now return location + warehouse data for each stock record.

### 4. Fixed order client null handling
- File: `src/orders/orders.service.ts`
- Change: added a `client` existence check after `findUnique()` / `upsert()`.
- Verify: checkout session creation fails with a clear `BadRequestException` if client creation/query fails.

### 5. Fixed unsupported Post fields
- File: `src/posts/posts.service.ts`
- Change: removed the non-existent `published` filter from `prisma.post.findMany()`.
- Verify: blog/post listing compiles and returns all posts ordered by `createdAt`.

### 6. Fixed supplier relation includes
- File: `src/supplier/supplier.service.ts`
- Change: removed unsupported `receipts` / `items` include paths that did not exist in the current Prisma schema.
- Verify: supplier list/detail queries compile and return supplier records correctly.

### 7. Build result
- Final verification step: `npm run build` completed successfully with zero TypeScript errors.

---

## 🧪 Verification Examples
Use the following examples to confirm the backend behavior step by step.

### Example A: Regenerate Prisma client and build
```bash
cd backend
npm run prisma:generate
npm run build
```
Expected result: `Prisma Client` generated successfully and `tsc` completes with no errors.

### Example B: Create a new warehouse
```bash
POST /warehouse
Content-Type: application/json

{
  "code": "K1",
  "name": "Main Warehouse",
  "address": "123 Industrial Road"
}
```
Expected result: warehouse created with `id`, `code`, `name`, and optional `address`.

### Example C: Create a location using warehouse code generation
```bash
POST /warehouse/locations
Content-Type: application/json

{
  "warehouseId": "<warehouseId>",
  "zone": "A",
  "rack": "01",
  "slot": "02",
  "capacity": 50
}
```
Expected result: `locationCode` is auto-generated as `K1-A-01-02` when `locationCode` is not provided.

### Example D: Create a category and verify stock include
```bash
POST /categories
Content-Type: application/json

{
  "name": "Nexen 6.00-9 Solid",
  "tireSize": "6.00-9",
  "brand": "Nexen",
  "tireType": "SOLID",
  "rimType": "STANDARD",
  "origin": "Vietnam",
  "condition": "NEW",
  "specifications": "Heavy-duty forklift tire"
}
```
Expected result: category created successfully, and GET `/categories/:id` returns related `stocks` with `location` and `warehouse`.

### Example E: Create a checkout session and ensure client exists
```bash
POST /orders/checkout
Content-Type: application/json

{
  "items": [
    { "productId": "<productId>", "locationId": "<locationId>", "quantity": 2 }
  ]
}
```
Expected result: if client creation/query succeeds, checkout session is created; if not, the request returns a validation error.

---

## Notes
- Nếu bạn muốn kiểm tra từng endpoint, hãy chạy lại `npm run build` trước để đảm bảo mã nguồn đã đồng bộ.
- Các điểm chỉnh sửa chính tương ứng với những file backend đã cập nhật và các lỗi biên dịch đã được sửa.

## 📝 Usage Examples

### Example 1: Create a Tire Category

```bash
POST /categories
Content-Type: application/json

{
  "name": "Nexen 6.00-9 Solid",
  "tireSize": "6.00-9",
  "brand": "Nexen",
  "tireType": "SOLID",
  "rimType": "STANDARD",
  "origin": "Vietnam",
  "condition": "NEW",
  "specifications": "Forklift tire, 8-layer rating"
}
```

### Example 2: Setup Warehouse Structure

```bash
# 1. Create Warehouse
POST /warehouse
{
  "code": "K1",
  "name": "Kho chính"
}

# 2. Create Zone
POST /warehouse/zones
{
  "warehouseId": "{warehouse_id}",
  "code": "A1",
  "name": "Dãy A"
}

# 3. Create Rack
POST /warehouse/racks
{
  "zoneId": "{zone_id}",
  "code": "R1",
  "name": "Kệ 1"
}

# 4. Create Slot
POST /warehouse/slots
{
  "rackId": "{rack_id}",
  "code": "L1",
  "name": "Tầng 1",
  "barcode": "K1-A1-R1-L1"
}
```

### Example 3: Create and Confirm Goods Receipt

```bash
# 1. Create Receipt
POST /inventory/receipts
{
  "supplierId": "{supplier_id}",
  "notes": "Nhập lốp Nexen từ nhà cung cấp",
  "items": [
    {
      "categoryId": "{category_id}",
      "quantity": 100,
      "unitPrice": 150000,
      "slotId": "{slot_id}",
      "notes": "Lô hàng A"
    }
  ]
}

# Response: Receipt with status DRAFT
{
  "id": "receipt_123",
  "code": "RCPT-1234567890",
  "status": "DRAFT",
  ...
}

# 2. Confirm Receipt
PATCH /inventory/receipts/{receipt_id}/confirm
{
  "notes": "Confirmed by warehouse manager"
}

# Effect: Stock is updated, InventoryLog is created
```

### Example 4: Create and Confirm Goods Issue

```bash
# 1. Create Issue
POST /inventory/issues
{
  "clientId": "{client_id}",
  "reason": "Sale",
  "notes": "Đơn hàng #001",
  "items": [
    {
      "categoryId": "{category_id}",
      "quantity": 10,
      "slotId": "{slot_id}",
      "notes": "Từ lô hàng A"
    }
  ]
}

# 2. Confirm Issue
PATCH /inventory/issues/{issue_id}/confirm
{
  "notes": "Confirmed by warehouse manager"
}

# Effect: Stock is reduced, InventoryLog is created
```

### Example 5: Check Stock by Location

```bash
# Get all stock for a specific category
GET /inventory/stocks/category/{category_id}

# Response:
[
  {
    "id": "stock_1",
    "categoryId": "cat_123",
    "slotId": "slot_1",
    "quantity": 50,
    "slot": {
      "code": "L1",
      "barcode": "K1-A1-R1-L1",
      "rack": {
        "code": "R1",
        "zone": {
          "code": "A1",
          "warehouse": {
            "code": "K1"
          }
        }
      }
    }
  }
]
```

---

## 🔄 Workflow

### Incoming Goods Workflow
1. Create Receipt (DRAFT)
2. Add receipt items with category and target location
3. Confirm Receipt → Stock is updated, InventoryLog created
4. Can verify stock via `/inventory/stocks/category/{id}`

### Outgoing Goods Workflow
1. Create Issue (DRAFT)
2. Add issue items specifying which location to pull from
3. System validates stock availability
4. Confirm Issue → Stock is reduced, InventoryLog created
5. Track transaction via InventoryLog

---

## 🔐 Data Integrity

- **Stock Consistency:** Stock cannot go negative during issue confirmation
- **Location Uniqueness:** Each category can only have one stock record per location
- **Audit Trail:** All transactions logged in InventoryLog
- **Cascading Deletes:** Deleting warehouse/zone/rack deletes children but preserves stock history

---

## 🚀 Next Steps

1. **Run Database Migration:**
   ```bash
   npx prisma migrate dev --name init_warehouse
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Test API Endpoints** using Postman or similar tool

4. **Frontend Integration:** Create UI for:
   - Category management
   - Warehouse structure visualization
   - Receipt/Issue creation and confirmation
   - Stock level monitoring
   - Barcode scanning for location lookup

5. **Optional Enhancements:**
   - Barcode/QR code generation
   - Stock low-level alerts
   - Advanced filtering and reporting
   - Multi-level approval workflow
   - Stock transfer between locations

---

## 📚 Technologies

- **NestJS:** Backend framework
- **Prisma:** ORM and database management
- **PostgreSQL:** Database
- **TypeScript:** Type safety

---

## 📞 Support

For questions or issues, refer to:
- Prisma Documentation: https://www.prisma.io/docs/
- NestJS Documentation: https://docs.nestjs.com/
