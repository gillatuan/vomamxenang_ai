Nhiệm vụ: Viết file hướng dẫn (`README.md`) kiểm thử hệ thống, bao gồm kịch bản test lọc sản phẩm mới/cũ, quy trình quét mã QR, ép mâm bằng lệnh `curl`.

YÊU CẦU THỰC HIỆN:
Tạo tài liệu hướng dẫn chạy và kiểm thử hệ thống từng bước:
1. Hướng dẫn thiết lập môi trường, cấu hình file `.env` (PostgreSQL, JWT, Stripe).
2. Hướng dẫn chạy Migrate DB và tệp seed dữ liệu.
3. Cung cấp các lệnh `curl` kiểm thử:
   - Đăng nhập tài khoản Admin lấy JWT Token.
   - Thêm sản phẩm Vỏ xe mới (`condition: "NEW"`) và Mâm xe cũ (`condition: "USED"`).
   - Gọi API lấy danh sách lốp mới: `GET /api/v1/products?condition=NEW`.
   - Gọi API lấy chi tiết sản phẩm: `GET /api/v1/products/<id>`.
   - Giả lập gọi API Combo Ép mâm xe nâng (`/inventory/assembly`).