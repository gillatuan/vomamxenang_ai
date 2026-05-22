# Warehouse Management System - Setup Guide

## 📋 Prerequisites

- Node.js 16+ installed
- PostgreSQL database running
- NestJS project setup complete

---

## 🚀 Installation Steps

### Step 1: Update Database Connection

Make sure your `.env` file has the correct PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/forklift_db"
```

### Step 2: Create Database Migration

Run Prisma migration to update your database schema:

```bash
cd backend
npx prisma migrate dev --name init_warehouse_management_system
```

This will:
- Create new tables (Category, Warehouse, Zone, Rack, Slot, Stock, Receipt, Issue, InventoryLog, Supplier)
- Generate Prisma Client automatically

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Verify Installation

```bash
npx prisma db push
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── category/                    # NEW - Tire catalog management
│   │   ├── category.controller.ts
│   │   ├── category.service.ts
│   │   ├── category.module.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── warehouse/                   # NEW - Warehouse structure
│   │   ├── warehouse.controller.ts
│   │   ├── warehouse.service.ts
│   │   ├── warehouse.module.ts
│   │   └── dto/
│   │       ├── create-warehouse.dto.ts
│   │       ├── create-zone.dto.ts
│   │       ├── create-rack.dto.ts
│   │       └── create-slot.dto.ts
│   │
│   ├── inventory/                   # NEW - Goods receipts & issues
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   ├── inventory.module.ts
│   │   └── dto/
│   │       ├── create-receipt.dto.ts
│   │       ├── confirm-receipt.dto.ts
│   │       ├── create-issue.dto.ts
│   │       └── confirm-issue.dto.ts
│   │
│   ├── supplier/                    # NEW - Supplier management
│   │   ├── supplier.controller.ts
│   │   ├── supplier.service.ts
│   │   ├── supplier.module.ts
│   │   └── dto/
│   │       ├── create-supplier.dto.ts
│   │       └── update-supplier.dto.ts
│   │
│   ├── app.module.ts                # UPDATED - Added new modules
│   └── ... (existing modules)
│
├── prisma/
│   └── schema.prisma                # UPDATED - Added warehouse models
│
└── WAREHOUSE_IMPLEMENTATION.md      # NEW - Complete documentation
```

---

## ✅ Verification Checklist

After running migrations, verify everything is working:

### Check 1: Database Tables
```bash
npx prisma studio
```
You should see these new tables:
- Category
- Warehouse, Zone, Rack, Slot
- Stock
- Receipt, ReceiptItem
- Issue, IssueItem
- InventoryLog
- Supplier

### Check 2: Start Backend
```bash
npm run start:dev
```

Expected output:
```
[Nest] 12345 - 01/01/2026, 12:00:00 PM     LOG [BootstrapModule] NestFactory bootstrapped successfully +123ms
[Nest] 12345 - 01/01/2026, 12:00:00 PM     LOG [InstanceLoader] CategoryModule dependencies initialized +456ms
[Nest] 12345 - 01/01/2026, 12:00:00 PM     LOG [InstanceLoader] WarehouseModule dependencies initialized +789ms
[Nest] 12345 - 01/01/2026, 12:00:00 PM     LOG [InstanceLoader] InventoryModule dependencies initialized +123ms
[Nest] 12345 - 01/01/2026, 12:00:00 PM     LOG [InstanceLoader] SupplierModule dependencies initialized +456ms
```

### Check 3: API Health Check
```bash
curl http://localhost:3000/api/v1/categories
# Should return: []
```

---

## 🧪 Quick Test

### 1. Create a Supplier
```bash
curl -X POST http://localhost:3000/api/v1/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nexen Vietnam",
    "email": "supplier@nexen.com",
    "phone": "+84123456789",
    "address": "Ho Chi Minh City"
  }'
```

### 2. Create a Warehouse
```bash
curl -X POST http://localhost:3000/api/v1/warehouse \
  -H "Content-Type: application/json" \
  -d '{
    "code": "K1",
    "name": "Kho chính"
  }'
```

### 3. Create a Category
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nexen 6.00-9 Solid",
    "tireSize": "6.00-9",
    "brand": "Nexen",
    "tireType": "SOLID",
    "rimType": "STANDARD",
    "origin": "Vietnam",
    "condition": "NEW"
  }'
```

---

## 📖 Full Documentation

For complete API documentation, examples, and workflows, see:
- **`backend/WAREHOUSE_IMPLEMENTATION.md`** - Complete implementation guide

---

## 🔧 Troubleshooting

### Issue: "Prisma Client not generated"
**Solution:**
```bash
npx prisma generate
npm install @prisma/client
```

### Issue: "Migration conflicts"
**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually:
npx prisma db push --force-reset
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
PORT=3001 npm run start:dev
```

---

## 🎯 Next Steps

1. ✅ Run migrations
2. ✅ Start backend server
3. ⬜ Implement frontend UI (Dashboard, Receipt/Issue forms, Stock monitoring)
4. ⬜ Add authentication/authorization to warehouse endpoints
5. ⬜ Create mobile app for barcode scanning
6. ⬜ Setup real-time notifications for low stock

---

## 📞 API Base URL

- Development: `http://localhost:3000`
- All endpoints follow REST conventions
- Response format: JSON

---

## 📚 Related Files

- Database Schema: `backend/prisma/schema.prisma`
- Main Documentation: `backend/WAREHOUSE_IMPLEMENTATION.md`
- App Configuration: `backend/src/app.module.ts`

---

**Ready to go!** 🚀
