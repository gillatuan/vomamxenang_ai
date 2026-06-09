Nhiệm vụ: Triển khai AuthModule trong NestJS tích hợp phân quyền chặt chẽ cho 2 nhóm đối tượng (Admin Manager & Nhân viên kho), hỗ trợ tối ưu giao diện quét mã trên thiết bị di động.

YÊU CẦU THỰC HIỆN:
1. Cung cấp các lệnh cài đặt thư viện cần thiết: `@nestjs/jwt`, `bcrypt`.
2. Tạo `AuthModule` có endpoint `POST /auth/register` và `POST /auth/login` bên trong `AuthController`.
3. Mật khẩu phải được băm bằng `bcrypt` trước khi lưu. Endpoint login trả về một chuỗi JWT access token chứa thông tin `id`, `email`, và `role`.
4. Tạo `JwtAuthGuard` để bảo vệ các API endpoint nội bộ.
5. Tạo `RolesGuard` để phân quyền:
   - "ADMIN_MANAGER": Toàn quyền hệ thống, xem giá tiền, chỉnh sửa bảng giá tài chính.
   - "STOREKEEPER": Chỉ thao tác trên sơ đồ kho, nhập/xuất kho vật lý, và quét QR. Ẩn hoàn toàn dữ liệu tiền tệ.
6. Cung cấp một đoạn mã seed dữ liệu mẫu (`prisma/seed.ts`) để tự động tạo một tài khoản Admin mặc định (`admin@vomamxenang.local` / `admin123`).