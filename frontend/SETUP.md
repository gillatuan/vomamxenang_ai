# Frontend Setup Guide

## 1. Chuẩn bị môi trường

1. Cài đặt Node.js v18+
2. Mở terminal và chuyển vào thư mục frontend:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/own/demo/vomamxenang_ai/frontend
   ```
3. Cài dependencies:
   ```bash
   yarn install
   # hoặc npm install
   ```

## 2. Cấu hình kết nối API

1. Mở file `.env.local` và xác nhận giá trị:
   ```env
   NEXT_PUBLIC_API_BASE="http://localhost:3001/api/v1"
   ```
2. Nếu backend chạy trên port khác, đổi `3001` thành port backend đang dùng.

## 3. Seed dữ liệu mẫu

Frontend phụ thuộc vào backend để có dữ liệu sản phẩm, khách hàng và admin. Để khởi tạo dữ liệu mẫu, chạy seed backend:

```bash
cd ../backend
yarn seed
# hoặc npm run seed
```

> Script seed sẽ tạo:
> - Admin user: `admin@vomamxenang.local` / `admin123`
> - Khách hàng mẫu
> - Sản phẩm mẫu
> - Mâm mẫu
> - Kho và vị trí kệ mẫu
> - Một số bài viết blog mẫu
> - Đơn hàng mẫu

## 4. Khởi chạy frontend

```bash
yarn dev
# hoặc npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

## 5. Hướng dẫn flow từng bước

### 5.1 Public shopping flow
1. Vào trang chủ `/` để xem nội dung landing.
2. Vào trang `/products` để xem danh sách sản phẩm.
3. Nhấn "Thêm vào giỏ" với sản phẩm cần mua.
4. Mở giỏ hàng bằng icon cart ở header.
5. Kiểm tra số lượng và nhấn thanh toán.
6. Frontend gửi request tới `POST /orders/checkout-session`.
7. Nếu cấu hình Stripe hợp lệ, người dùng được chuyển tới trang thanh toán Stripe.
8. Sau khi thanh toán thành công, người dùng sẽ được chuyển về `/checkout/success`.
9. Nếu hủy thanh toán, người dùng sẽ chuyển về `/checkout/cancel`.

### 5.2 Public blog flow
1. Vào `/blog`.
2. Trang sẽ gọi API `GET /posts`.
3. Bài viết hiển thị dựa trên dữ liệu mẫu seed từ backend.
4. Nếu không thấy bài viết, kiểm tra backend đã seed dữ liệu thành công.

### 5.3 Admin login và bảo mật
1. Vào `/admin/login`.
2. Nhập email: `admin@vomamxenang.local` và mật khẩu: `admin123`.
3. Sau đăng nhập thành công, token JWT được lưu vào `localStorage`.
4. Người dùng được redirect về `/admin`.
5. Nếu token hết hạn hoặc không hợp lệ, frontend sẽ tự động redirect về `/admin/login`.

### 5.4 Admin dashboard flow
1. Vào `/admin` sau khi login.
2. Dashboard hiển thị số liệu tồn kho, đơn hàng, cảnh báo kho thấp.
3. Nếu bạn là ADMIN_MANAGER, dashboard còn hiển thị đồ thị và biểu đồ phân tích.

### 5.5 Quản lý sản phẩm admin
1. Vào `/admin/products`.
2. Xem danh sách sản phẩm hiện có, phân theo tab Vỏ và Mâm.
3. Nhấn "Thêm sản phẩm" để mở form tạo mới.
4. Nhấn biểu tượng sửa để chỉnh sửa sản phẩm.
5. Nhấn xóa để xóa sản phẩm.
6. Khi lưu sản phẩm mới, frontend sẽ hiển thị preview QR và có nút in tem.

### 5.6 Quản lý kho và quét QR
1. Vào `/admin/warehouse`.
2. Xem sơ đồ vị trí kho và trạng thái lấp đầy từng slot.
3. Nhấn "Quét mã vị trí" để bật camera và quét QR.
4. Nếu không quét được, có thể nhập mã vị trí thủ công.

### 5.7 Nhập / xuất và dịch vụ ép mâm
1. Vào `/admin/import-export`.
2. Chọn khách hàng, loại sản phẩm và vị trí kho.
3. Kích hoạt dịch vụ ép mâm nếu cần.
4. Nhập số lượng, giá và vị trí kho.
5. Nhấn "Lưu phiếu" để tạo ghi nhận đơn hàng tạm thời.

## 6. Cấu trúc file quan trọng

- `src/app/providers.tsx`: cấu hình theme và AuthProvider.
- `src/context/auth.tsx`: quản lý user, token và role.
- `src/lib/api.ts`: axios instance với base URL và interceptor.
- `src/lib/api-client.ts`: các method gọi API.
- `src/store/cart.ts`: trạng thái giỏ hàng dùng Zustand.
- `src/app/admin/layout.tsx`: layout admin, menu, bảo mật.
- `src/app/admin/products/page.tsx`: trang quản lý sản phẩm.
- `src/app/admin/warehouse/page.tsx`: trang sơ đồ kho và quét QR.
- `src/app/admin/import-export/page.tsx`: trang nhập/xuất và dịch vụ ép.

## 7. Kiểm tra nhanh flow

1. Chạy backend và seed dữ liệu.
2. Chạy frontend.
3. Truy cập `/products`, thêm 1 sản phẩm vào giỏ.
4. Mở giỏ hàng, kiểm tra tổng tiền.
5. Đăng nhập admin và truy cập `/admin/products`.
6. Tạo mới hoặc sửa sản phẩm.
7. Vào `/admin/warehouse` và kiểm tra sơ đồ vị trí.
8. Vào `/admin/import-export` để kiểm tra tạo phiếu.

## 8. Build production

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/own/demo/vomamxenang_ai/frontend
yarn build
yarn start
```

## 9. Troubleshooting

- Nếu không load được API, kiểm tra `NEXT_PUBLIC_API_BASE`.
- Nếu không login được, kiểm tra backend seed và endpoint `/auth/login`.
- Nếu không thấy dữ liệu sản phẩm, chạy lại seed backend.
- Nếu Stripe không hoạt động, kiểm tra cấu hình Stripe backend và callback URL.
