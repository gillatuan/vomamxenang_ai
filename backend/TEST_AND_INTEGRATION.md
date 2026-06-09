# Hệ thống Quản lý Kho & Kinh doanh Vỏ Xe Nâng - Hướng dẫn Kiểm thử

## 1. Thiết lập Môi trường

### 1.1 Yêu cầu Hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### 1.2 Cấu hình File `.env`

Tạo file `.env` tại thư mục `/backend`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vomamxenang_db"

# JWT
JWT_SECRET="your-secret-key-here-min-32-chars-long-123456"
JWT_EXPIRATION="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

### 1.3 Cài đặt Dependencies

```bash
cd backend
npm install
```

## 2. Khởi tạo Database

### 2.1 Chạy Migration

```bash
npm run prisma:migrate
```

Hoặc nếu dùng Prisma Client:

```bash
npx prisma migrate dev --name init
```

### 2.2 Seed Dữ liệu Mẫu

```bash
npm run prisma:seed
```

Hoặc:

```bash
npx prisma db seed
```

Điều này sẽ tạo ra:
- **Tài khoản Admin mặc định**: `admin@vomamxenang.local` / `admin123`
- **Tài khoản Storekeeper mẫu**: `storekeeper@vomamxenang.local` / `store123`

## 3. Chạy Server Backend

```bash
npm run start:dev
```

Server sẽ chạy tại `http://localhost:3001`

## 4. Kiểm thử API bằng cURL

### 4.1 Đăng nhập (Login) - Lấy JWT Token

**Admin Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vomamxenang.local",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@vomamxenang.local",
    "role": "ADMIN_MANAGER"
  }
}
```

Lưu `access_token` để sử dụng cho các request tiếp theo. Gọi nó là `$TOKEN`.

**Storekeeper Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "storekeeper@vomamxenang.local",
    "password": "store123"
  }'
```

### 4.2 Thêm Sản phẩm Vỏ xe Mới (NEW)

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "VX6009NEW001",
    "type": "TIRE",
    "name": "Vỏ Casumina Solid 6.00-9 NEW",
    "size": "6.00-9",
    "brand": "Casumina",
    "tireType": "SOLID",
    "rimType": "LIP",
    "condition": "NEW_100",
    "importPrice": 250000,
    "sellingPrice": 350000,
    "minStock": 5,
    "maxStock": 50,
    "description": "Vỏ xe nâng loại mới 100%"
  }'
```

**Response:**
```json
{
  "id": "product-id-here",
  "sku": "VX6009NEW001",
  "name": "Vỏ Casumina Solid 6.00-9 NEW",
  "condition": "NEW_100",
  "importPrice": 250000,
  "sellingPrice": 350000,
  ...
}
```

### 4.3 Thêm Sản phẩm Vỏ xe Cũ (USED)

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "VX6009USED001",
    "type": "TIRE",
    "name": "Vỏ Casumina Solid 6.00-9 USED",
    "size": "6.00-9",
    "brand": "Casumina",
    "tireType": "SOLID",
    "rimType": "LIP",
    "condition": "USED",
    "importPrice": 150000,
    "sellingPrice": 200000,
    "minStock": 5,
    "maxStock": 50,
    "description": "Vỏ xe nâng loại đã qua sử dụng"
  }'
```

### 4.4 Lấy Danh sách Sản phẩm Mới (condition=NEW)

```bash
curl -X GET "http://localhost:3001/products?condition=NEW_100" \
  -H "Content-Type: application/json"
```

**Response (Array of products with condition NEW_100):**
```json
[
  {
    "id": "product-id",
    "sku": "VX6009NEW001",
    "name": "Vỏ Casumina Solid 6.00-9 NEW",
    "condition": "NEW_100",
    "importPrice": 250000,
    "sellingPrice": 350000,
    ...
  }
]
```

### 4.5 Lấy Danh sách Sản phẩm Cũ (condition=USED)

```bash
curl -X GET "http://localhost:3001/products?condition=USED" \
  -H "Content-Type: application/json"
```

### 4.6 Lấy Chi tiết Sản phẩm (Product Detail)

```bash
curl -X GET http://localhost:3001/products/{product-id} \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "id": "product-id",
  "sku": "VX6009NEW001",
  "name": "Vỏ Casumina Solid 6.00-9 NEW",
  "size": "6.00-9",
  "brand": "Casumina",
  "tireType": "SOLID",
  "rimType": "LIP",
  "condition": "NEW_100",
  "importPrice": 250000,
  "sellingPrice": 350000,
  "minStock": 5,
  "maxStock": 50,
  "description": "Vỏ xe nâng loại mới 100%",
  "createdAt": "2026-06-09T10:00:00Z"
}
```

### 4.7 Thêm Mâm Xe (WheelRim)

```bash
curl -X POST http://localhost:3001/wheel-rims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "RIM7001",
    "size": "6.00-9",
    "boltHoles": 4,
    "brand": "Toyota",
    "compatibleModels": "Toyota 8FG",
    "importPrice": 500000,
    "sellingPrice": 700000
  }'
```

### 4.8 Lấy Danh sách Mâm Xe

```bash
curl -X GET http://localhost:3001/wheel-rims \
  -H "Content-Type: application/json"
```

### 4.9 Lấy Chi tiết Mâm Xe

```bash
curl -X GET http://localhost:3001/wheel-rims/{rim-id} \
  -H "Content-Type: application/json"
```

### 4.10 Quét Mã QR (Warehouse Scan)

```bash
curl -X POST http://localhost:3001/warehouse/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "VX6009NEW001"
  }'
```

**Response:**
```json
{
  "product": {
    "id": "product-id",
    "sku": "VX6009NEW001",
    "name": "Vỏ Casumina Solid 6.00-9 NEW",
    ...
  },
  "locations": [
    {
      "id": "location-id",
      "zone": "A",
      "rack": "01",
      "slot": "01",
      "quantity": 10
    }
  ]
}
```

### 4.11 Ép Mâm Xe Nâng (Assembly)

```bash
curl -X POST http://localhost:3001/inventory/assembly \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "product-id-here",
    "wheelRimId": "rim-id-here",
    "quantity": 5,
    "pressingFee": 50000,
    "locationId": "location-id-here"
  }'
```

**Response:**
```json
{
  "id": "assembly-log-id",
  "productId": "product-id",
  "wheelRimId": "rim-id",
  "quantity": 5,
  "pressingFee": 50000,
  "userId": "user-id",
  "createdAt": "2026-06-09T10:30:00Z",
  "message": "Ép mâm thành công: 5 bộ vỏ-mâm"
}
```

## 5. Kiểm thử Phân quyền (Role-based Access)

### 5.1 Admin (ADMIN_MANAGER) - Thấy được Giá tiền

Đăng nhập với Admin, các endpoint trả về dữ liệu đầy đủ bao gồm:
- `importPrice`
- `sellingPrice`
- `priceMatrix` (Bảng giá B2B)

### 5.2 Storekeeper - KHÔNG thấy Giá tiền

Đăng nhập với Storekeeper, cùng endpoint nhưng response sẽ:
- **XÓA** `importPrice`, `sellingPrice`, `priceMatrix`
- Chỉ trả về thông tin kỹ thuật: `sku`, `size`, `brand`, `condition`, `quantity` tại kho

Ví dụ:

```bash
# Login as Storekeeper
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "storekeeper@vomamxenang.local",
    "password": "store123"
  }'

# Save the token as $STOREKEEPER_TOKEN

# Get product - Will NOT show prices
curl -X GET http://localhost:3001/products \
  -H "Authorization: Bearer $STOREKEEPER_TOKEN"
```

**Response (Storekeeper):**
```json
[
  {
    "id": "product-id",
    "sku": "VX6009NEW001",
    "name": "Vỏ Casumina Solid 6.00-9 NEW",
    "size": "6.00-9",
    "brand": "Casumina",
    "tireType": "SOLID",
    "rimType": "LIP",
    "condition": "NEW_100",
    // NOTE: importPrice, sellingPrice REMOVED for STOREKEEPER
    "minStock": 5,
    "maxStock": 50,
    "description": "Vỏ xe nâng loại mới 100%",
    "createdAt": "2026-06-09T10:00:00Z"
  }
]
```

## 6. Kiểm thử Frontend (Next.js)

### 6.1 Cài đặt Dependencies

```bash
cd frontend
npm install
```

### 6.2 Chạy Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

### 6.3 Đăng nhập Frontend

1. Mở `http://localhost:3000/admin/login`
2. Đăng nhập với:
   - **Admin**: `admin@vomamxenang.local` / `admin123`
   - **Storekeeper**: `storekeeper@vomamxenang.local` / `store123`

### 6.4 Kiểm thử Giao diện Phân quyền

**Admin Manager:**
- Thấy tab "Dashboard Doanh thu"
- Thấy tab "Quản lý Giá"
- Thấy tất cả giá tiền sản phẩm

**Storekeeper:**
- KHÔNG thấy tab "Dashboard Doanh thu"
- KHÔNG thấy tab "Quản lý Giá"
- Thấy "Sơ đồ Kho", "Nhập/Xuất Kho", "Quét QR"
- Giá tiền được ẩn hoàn toàn

## 7. Troubleshooting

### 7.1 Lỗi Connection Database

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Giải pháp:**
- Kiểm tra PostgreSQL có đang chạy: `psql --version`
- Kiểm tra `DATABASE_URL` trong `.env` đúng
- Tạo database: `createdb vomamxenang_db`

### 7.2 Lỗi JWT Token Expired

```
401 Unauthorized: Token expired
```

**Giải pháp:**
- Đăng nhập lại để lấy token mới
- Hoặc thay đổi `JWT_EXPIRATION` trong `.env`

### 7.3 Lỗi Prisma Migration

```
Error: P3014 Prisma Migrate could not create the shadow database
```

**Giải pháp:**
```bash
# Reset database
npx prisma migrate reset --force

# Seed lại
npx prisma db seed
```

## 8. API Endpoints Summary

| Method | Endpoint | Auth | Role | Mô tả |
|--------|----------|------|------|-------|
| POST | `/auth/login` | No | - | Đăng nhập |
| POST | `/auth/register` | No | - | Đăng ký |
| GET | `/products` | No | - | Danh sách sản phẩm (hỗ trợ filter `condition`) |
| GET | `/products/:id` | No | - | Chi tiết sản phẩm |
| POST | `/products` | Yes | ADMIN_MANAGER | Thêm sản phẩm |
| PATCH | `/products/:id` | Yes | ADMIN_MANAGER | Cập nhật sản phẩm |
| DELETE | `/products/:id` | Yes | ADMIN_MANAGER | Xóa sản phẩm |
| GET | `/wheel-rims` | No | - | Danh sách mâm xe |
| GET | `/wheel-rims/:id` | No | - | Chi tiết mâm xe |
| POST | `/wheel-rims` | Yes | ADMIN_MANAGER | Thêm mâm xe |
| PATCH | `/wheel-rims/:id` | Yes | ADMIN_MANAGER | Cập nhật mâm xe |
| DELETE | `/wheel-rims/:id` | Yes | ADMIN_MANAGER | Xóa mâm xe |
| GET | `/clients` | No | - | Danh sách khách hàng |
| GET | `/clients/:id` | No | - | Chi tiết khách hàng |
| POST | `/clients` | Yes | ADMIN_MANAGER | Thêm khách hàng |
| PATCH | `/clients/:id` | Yes | ADMIN_MANAGER | Cập nhật khách hàng |
| DELETE | `/clients/:id` | Yes | ADMIN_MANAGER | Xóa khách hàng |
| GET | `/warehouse/map` | Yes | - | Sơ đồ kho |
| POST | `/warehouse/scan` | Yes | - | Quét mã QR |
| POST | `/inventory/assembly` | Yes | - | Ép mâm xe |

### 4.12 Stripe Checkout - Examples (Guest vs Logged-in)

Guest checkout (no auth):
```bash
curl -X POST http://localhost:3001/orders/checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "{product-id}", "locationId": "{location-id}", "quantity": 2 }
    ]
  }'
```

Logged-in checkout (use JWT token `$TOKEN` obtained from /auth/login):
```bash
curl -X POST http://localhost:3001/orders/checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      { "productId": "{product-id}", "locationId": "{location-id}", "quantity": 1 }
    ]
  }'
```

---

## Ghi Chú Quan trọng

1. **Phân quyền STOREKEEPER**: Tất cả giá tiền (`importPrice`, `sellingPrice`) sẽ tự động được xóa khỏi response để bảo mật
2. **Condition Filter**: Sử dụng `?condition=NEW_100` hoặc `?condition=USED` để lọc sản phẩm theo trạng thái
3. **JWT Token**: Token có hiệu lực trong `JWT_EXPIRATION` (mặc định 7 ngày)
4. **CORS**: Frontend (port 3000) và Backend (port 3001) được cấu hình CORS để giao tiếp

---

**Ngày cập nhật**: 2026-06-09
**Phiên bản**: 1.0.0
