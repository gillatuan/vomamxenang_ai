Nhiệm vụ: Viết file hướng dẫn (`README.md`) kiểm thử hệ thống, bao gồm kịch bản test luồng tương tác người dùng, lọc sản phẩm mới/cũ, quy trình quét mã QR, và thanh toán Stripe bằng lệnh `curl`.

YÊU CẦU THỰC HIỆN:
Tạo tài liệu hướng dẫn chạy và kiểm thử hệ thống từng bước:
1. Hướng dẫn thiết lập môi trường, cấu hình file `.env` (PostgreSQL, JWT, Stripe).
2. Hướng dẫn chạy Migrate DB và tệp seed dữ liệu (Bao gồm dữ liệu sản phẩm mới/cũ và bài viết blog/comment mặc định).
3. Cung cấp các lệnh `curl` kiểm thử:
   - Đăng nhập tài khoản lấy JWT Token.
   - Thêm bình luận vào sản phẩm và bài viết blog.
   - Gọi API lấy danh sách lốp mới: `GET /api/v1/products?condition=NEW`.
   - Giả lập gọi API Combo Ép mâm xe nâng (`/inventory/assembly`).
   - Gọi API tạo Session Checkout Stripe gửi đầy đủ thông tin sản phẩm từ giỏ hàng để kiểm tra luồng Next step.