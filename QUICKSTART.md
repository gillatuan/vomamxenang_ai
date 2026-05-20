# Hướng dẫn setup và chạy toàn bộ ứng dụng

## 📋 Yêu cầu

- Node.js v18+
- PostgreSQL 13+
- Yarn hoặc npm

## 🚀 Setup Backend

### 1. Di chuyển vào folder backend

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/own/demo/vomamxenang_ai/backend
```

### 2. Cài đặt dependencies

```bash
yarn install
```

### 3. Cấu hình `.env`

```env
PORT=3001
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..." # (hoặc PostgreSQL local)
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"
```

### 4. Chạy Prisma setup

```bash
# Tạo Prisma client
yarn prisma generate

# Chạy migrations (nếu chưa chạy)
yarn prisma:migrate

# Tạo dữ liệu seed
yarn seed
```

### 5. Chạy backend

```bash
yarn start
```

✅ Backend chạy trên: `http://localhost:3001`

---

## 🎨 Setup Frontend

### 1. Di chuyển vào folder frontend

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/own/demo/vomamxenang_ai/frontend
```

### 2. Cài đặt dependencies

```bash
yarn install
```

### 3. Cấu hình `.env.local`

```env
NEXT_PUBLIC_API_BASE="http://localhost:3001/api/v1"
```

### 4. Chạy frontend

```bash
yarn dev
```

✅ Frontend chạy trên: `http://localhost:3000`

---

## 📱 Test ứng dụng

### Bước 1: Kiểm tra trang công khai

- Trang chủ: `http://localhost:3000/`
- Blog: `http://localhost:3000/blog`
- Sản phẩm: `http://localhost:3000/products`

### Bước 2: Thêm sản phẩm vào giỏ

1. Vào `/products`
2. Click "Thêm vào giỏ" trên sản phẩm có giá
3. Kiểm tra giỏ hàng ở góc phải (icon shopping cart)

### Bước 3: Yêu cầu báo giá

1. Vào `/products`
2. Click "Nhận báo giá" trên sản phẩm không có giá
3. Điền thông tin và gửi
4. Kiểm tra backend: `GET /api/v1/clients` để thấy lead mới

### Bước 4: Đăng nhập Admin

1. Vào `http://localhost:3000/admin/login`
2. Email: `admin@vomamxenang.local`
3. Password: `admin123`
4. Kiểm tra dashboard

### Bước 5: Quản lý dữ liệu

- **Dashboard** (`/admin`): Hiển thị thống kê
- **Khách hàng** (`/admin/clients`): CRUD clients
- **Sản phẩm** (`/admin/products`): CRUD products

---

## 🧪 Test API bằng curl (tuỳ chọn)

### Lấy danh sách sản phẩm

```bash
curl http://localhost:3001/api/v1/products
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vomamxenang.local","password":"admin123"}'
```

Sẽ nhận về:
```json
{
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "admin@vomamxenang.local",
    "role": "ADMIN"
  }
}
```

### Tạo client mới (JWT required)

```bash
ACCESSTOKEN="<paste-token-từ-trên>"

curl -X POST http://localhost:3001/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESSTOKEN" \
  -d '{
    "name": "Khách mới",
    "email": "new@client.com",
    "phone": "0909999999"
  }'
```

---

## 🔍 Troubleshooting

### Backend không kết nối database
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` đúng trong `.env`
- Kiểm tra user/password PostgreSQL

### Frontend không kết nối backend
- Kiểm tra backend đang chạy trên port 3001
- Kiểm tra `NEXT_PUBLIC_API_BASE` đúng trong `.env.local`
- Kiểm tra CORS được enable trong backend

### Lỗi "Cannot find module"
- Chạy `yarn install` lại
- Xóa `node_modules` và `.yarn` cache: `rm -rf node_modules .yarn`

### Token hết hạn
- Clear localStorage: Mở DevTools (F12) → Application → Clear site data
- Login lại

---

## 📁 Cấu trúc thư mục

```
vomamxenang_ai/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Authentication
│   │   ├── clients/           # Clients management
│   │   ├── products/          # Products management
│   │   ├── orders/            # Orders & Stripe
│   │   ├── posts/             # Blog posts
│   │   ├── admin/             # Admin routes
│   │   └── prisma/            # Database
│   ├── prisma/
│   │   ├── schema.prisma      # Data schema
│   │   └── seed.ts            # Seed data
│   └── .env                   # Environment variables
│
└── frontend/                   # Next.js + MUI
    ├── src/
    │   ├── app/               # Pages (App Router)
    │   │   ├── page.tsx       # Homepage
    │   │   ├── blog/          # Blog page
    │   │   ├── products/      # Products page
    │   │   ├── admin/         # Admin layout & pages
    │   │   └── checkout/      # Checkout pages
    │   ├── components/        # Reusable components
    │   ├── lib/              # API clients & utilities
    │   ├── store/            # Zustand store (cart)
    │   └── context/          # React context (auth)
    ├── package.json
    └── .env.local            # Environment variables
```

---

## 💡 Ghi chú

- **Backend**: NestJS + Prisma + PostgreSQL + JWT
- **Frontend**: Next.js 14 + MUI 5 + Axios + Zustand + React Context
- **API**: RESTful, JWT authentication, CORS enabled
- **Database**: PostgreSQL (hoặc Prisma Accelerate)
- **Styling**: MUI theme (primary: #F57C00, secondary: #424242)

---

## ✅ Checklist

- [ ] Backend chạy ✅
- [ ] Frontend chạy ✅
- [ ] Có thể xem trang chủ ✅
- [ ] Có thể xem sản phẩm ✅
- [ ] Có thể thêm vào giỏ ✅
- [ ] Có thể yêu cầu báo giá ✅
- [ ] Có thể đăng nhập admin ✅
- [ ] Có thể quản lý clients ✅
- [ ] Có thể quản lý products ✅
