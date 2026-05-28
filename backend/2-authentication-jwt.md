Nhiệm vụ: Triển khai AuthModule trong NestJS tích hợp phân quyền chặt chẽ cho 2 nhóm đối tượng (Admin Manager & Nhân viên kho), hỗ trợ tối ưu giao diện quét mã trên thiết bị di động.

YÊU CẦU THỰC HIỆN:
1. Cung cấp các lệnh cài đặt thư viện cần thiết: `@nestjs/jwt`, `bcrypt` và các kiểu dữ liệu của chúng nếu cần.
2. Tạo `AuthModule` có endpoint `POST /auth/register` và `POST /auth/login` bên trong `AuthController`.
3. Mật khẩu của người dùng phải được băm (hash) bằng `bcrypt` trước khi lưu vào PostgreSQL. Endpoint login phải trả về một chuỗi JWT access token chứa thông tin `id`, `email`, và `role`.
4. Tạo một `JwtAuthGuard` để bảo vệ các API endpoint nội bộ. Chỉ những request có token hợp lệ mới được truy cập.
5. Tạo một Custom Guard hoặc Decorator `RolesGuard` để phân quyền:
   - "ADMIN_MANAGER": Được phép truy cập tất cả API bao gồm dashboard doanh thu, cấu hình bảng giá `PriceMatrix`.
   - "STOREKEEPER": Chỉ được phép gọi các API liên quan đến sản phẩm, mâm xe, sơ đồ kho và lập phiếu nhập/xuất kho. Bị chặn hoàn toàn tại các API liên quan đến tài chính, tiền tệ, và báo cáo tổng hợp.
6. Cung cấp một đoạn mã seed dữ liệu mẫu (`prisma/seed.ts`) để tự động tạo một tài khoản Admin mặc định (`admin@vomamxenang.local` / `admin123`) khi chạy lệnh khởi tạo hệ thống.