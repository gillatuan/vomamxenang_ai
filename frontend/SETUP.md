# Frontend Setup Guide

## Chuẩn bị

1. **Node.js**: Đảm bảo bạn đã cài Node.js v18+

2. **Di chuyển vào folder frontend**:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/own/demo/vomamxenang_ai/frontend
   ```

3. **Cài đặt dependencies**:
   ```bash
   yarn install
   # hoặc npm install
   ```

## Cấu hình

1. **Kiểm tra file `.env.local`** (đã có sẵn):
   ```env
   NEXT_PUBLIC_API_BASE="http://localhost:3001/api/v1"
   ```

2. **Nếu backend chạy trên port khác**, sửa đường dẫn trong `.env.local`.

## Chạy Frontend

```bash
yarn dev
# hoặc npm run dev
```

Frontend sẽ mở trên: `http://localhost:3000`

## Cấu trúc Pages

- `/` - Trang chủ
- `/blog` - Blog (danh sách bài viết)
- `/products` - Sản phẩm (grid với nút "Thêm vào giỏ" hoặc "Nhận báo giá")
- `/admin/login` - Đăng nhập admin
- `/admin` - Dashboard (thống kê)
- `/admin/clients` - Quản lý khách hàng
- `/admin/products` - Quản lý sản phẩm
- `/checkout/success` - Thanh toán thành công
- `/checkout/cancel` - Thanh toán bị hủy

## Cách hoạt động

### Public Routes
- Trang chủ, blog, sản phẩm: không cần login
- Giỏ hàng: lưu trên client (localStorage via Zustand)
- Nhận báo giá: gửi dữ liệu `POST /clients`

### Admin Routes (Cần JWT)
- Tự động redirect đến `/admin/login` nếu chưa login
- Sau login, token được lưu vào `localStorage`
- Các request API tự động thêm `Authorization: Bearer <token>` header

### Flow Checkout
1. Thêm sản phẩm vào giỏ
2. Click "Thanh toán"
3. Gửi `POST /orders/checkout-session` với chi tiết giỏ
4. Backend trả về Stripe URL
5. Redirect đến Stripe Checkout
6. Sau thanh toán → `/checkout/success` hoặc `/checkout/cancel`

## Components chính

- **Header/PublicHeader**: Navigation bar với cart icon
- **CartDrawer**: Drawer hiển thị giỏ hàng
- **Footer**: Footer chung
- **AuthProvider**: Context quản lý JWT token

## API Client

Tất cả API calls dùng instance được cấu hình tại `src/lib/api.ts` với:
- Axios interceptor tự động thêm token
- Redirect đến login nếu token hết hạn (401)

## Development Tips

1. **Thay đổi theme**: Sửa `src/app/providers.tsx` - hàm `createTheme`
2. **Thay đổi API URL**: Cập nhật `.env.local`
3. **Tổng cart lỗi**: Check `src/store/cart.ts` - logic Zustand
4. **Lỗi CORS**: Đảm bảo backend đã enable CORS với `http://localhost:3000`

## Build Production

```bash
yarn build
yarn start
```

## Troubleshooting

1. **"Cannot find module"**: Chạy `yarn install` lại
2. **"API connection refused"**: Kiểm tra backend đang chạy
3. **Token hết hạn**: Logout, login lại
4. **Cart không lưu**: Kiểm tra browser có bật localStorage không
