Nhiệm vụ: Triển khai AuthModule trong NestJS tích hợp phân quyền chặt chẽ cho Admin Manager & Nhân viên kho, hỗ trợ đầy đủ các cổng xác thực (Đăng ký, Đăng nhập, Quên mật khẩu).

YÊU CẦU THỰC HIỆN:
1. Cung cấp các lệnh cài đặt thư viện cần thiết: `@nestjs/jwt`, `bcrypt`.
2. Tạo `AuthModule` có các endpoint sau trong `AuthController`:
   - `POST /auth/register`: Đăng ký tài khoản mới cho end-user.
   - `POST /auth/login`: Đăng nhập hệ thống, băm mật khẩu qua bcrypt, trả về JWT token (chứa id, email, role).
   - `POST /auth/forgot-password`: Nhận email và xử lý logic gửi mã/link reset mật khẩu (giả lập hoặc gửi qua console).
3. Tạo `JwtAuthGuard` để bảo vệ các API endpoint nội bộ.
4. Tạo `RolesGuard` để bảo vệ tài nguyên: ADMIN_MANAGER được xem báo cáo doanh thu và sửa bảng giá tài chính; STOREKEEPER chỉ quản lý sơ đồ kho, bốc dỡ hàng vật lý và ẩn hoàn toàn dữ liệu giá tiền.
5. Cung cấp đoạn mã seed dữ liệu mẫu (`prisma/seed.ts`) tạo tài khoản Admin mặc định (`admin@vomamxenang.local` / `admin123`).