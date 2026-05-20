# Hướng dẫn test và tích hợp backend

## 1. Chuẩn bị môi trường

1. Vào folder `backend`:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/own/demo/vomamxenang_ai/backend
   ```
2. Cài dependencies (nếu chưa cài):
   ```bash
   yarn install
   ```
3. Kiểm tra file `.env` có đủ biến môi trường:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/vomamxenang?schema=public"
   JWT_SECRET="replace-with-strong-secret"
   STRIPE_SECRET_KEY="sk_test_your_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_secret"
   FRONTEND_URL="http://localhost:3000"
   ```

## 2. Chạy Prisma và seed dữ liệu

1. Tạo Prisma client:
   ```bash
   yarn prisma generate
   ```
2. Chạy migrate (nếu chưa chạy):
   ```bash
   yarn prisma:migrate
   ```
3. Tạo dữ liệu test:
   ```bash
   yarn seed
   ```

## 3. Khởi động backend

```bash
yarn start
```

> Backend mặc định lắng nghe trên `http://localhost:3001`.

## 4. Các endpoint chính

Base URL: `http://localhost:3001/api/v1`

### Public endpoints
- `GET /auth/login` - không, phải dùng `POST`
- `POST /auth/login` - login lấy JWT
- `POST /auth/register` - đăng ký tài khoản mới
- `GET /products` - xem sản phẩm
- `GET /clients` - xem khách hàng
- `GET /posts` - xem bài viết
- `GET /orders` - xem đơn hàng

### Endpoint cần JWT
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /clients`
- `PATCH /clients/:id`
- `DELETE /clients/:id`
- `POST /posts`
- `PATCH /posts/:id`
- `DELETE /posts/:id`
- `POST /orders`
- `POST /orders/checkout-session`

## 5. Test bằng curl

### 5.1 Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vomamxenang.local","password":"admin123"}'
```

Kết quả trả về sẽ có `accessToken`.

### 5.2 Lấy danh sách sản phẩm

```bash
curl http://localhost:3001/api/v1/products
```

### 5.3 Tạo client mới (JWT required)

```bash
curl -X POST http://localhost:3001/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"name":"Khách mới","email":"newclient@example.com","phone":"0909999999"}'
```

### 5.4 Tạo sản phẩm mới (JWT required)

```bash
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"type":"TIRE","name":"Lốp test","importPrice":120000,"sellingPrice":150000,"quantityInStock":20}'
```

## 6. Tích hợp bằng code

### 6.1 Sử dụng fetch trong frontend

```js
const API_BASE = 'http://localhost:3001/api/v1';

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

async function createClient(token, clientData) {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(clientData),
  });
  return res.json();
}
```

### 6.2 Sử dụng axios

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
});

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function fetchProducts() {
  const response = await api.get('/products');
  return response.data;
}

export async function createProduct(token, data) {
  const response = await api.post('/products', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
```

### 6.3 Quy trình tích hợp frontend

1. Gọi `POST /auth/login` để lấy `accessToken`.
2. Lưu `token` vào `localStorage` hoặc `memory` (không dùng cookie HttpOnly trừ khi đã cấu hình server và frontend tương thích).
3. Khi gọi endpoint bảo mật, thêm header:
   ```http
   Authorization: Bearer <accessToken>
   ```
4. Với các request public như `GET /products`, không cần token.

## 7. Example flow test bước từng bước

1. Chạy backend với `yarn start`.
2. Login với `admin@vomamxenang.local` + `admin123`.
3. Copy `accessToken`.
4. Gọi `GET /api/v1/products` để xem sản phẩm có sẵn.
5. Gọi `POST /api/v1/clients` với token để tạo khách hàng mới.
6. Gọi `POST /api/v1/products` với token để thêm sản phẩm.
7. Gọi `POST /api/v1/orders` hoặc `POST /api/v1/orders/checkout-session` nếu muốn test đơn hàng.

## 8. Ghi chú

- Nếu dùng browser frontend, frontend cần chạy trên `http://localhost:3000` hoặc thay `FRONTEND_URL` trong `.env`.
- `POST /orders/checkout-session` sẽ tạo phiên checkout Stripe, cần cấu hình `STRIPE_SECRET_KEY` và `STRIPE_WEBHOOK_SECRET`.
- Nếu bạn cần test thêm route admin, có thể bổ sung theo cấu trúc `admin` module.
