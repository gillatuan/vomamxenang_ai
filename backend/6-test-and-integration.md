Nhiệm vụ: Viết file hướng dẫn (`README.md`) kiểm thử toàn diện hệ thống quản lý kho vỏ xe nâng, bao gồm kịch bản test quy trình quét mã QR, ép mâm và áp giá sỉ bằng lệnh `curl`.

YÊU CẦU THỰC HIỆN:
Tạo tài liệu hướng dẫn chạy và kiểm thử hệ thống từng bước một cách tường minh:
1. Hướng dẫn thiết lập môi trường, cấu hình file `.env` với các biến liên quan đến PostgreSQL, JWT, Stripe Webhook và cổng chạy mặc định `3001`.
2. Hướng dẫn các lệnh chạy Migrate DB, sinh tệp client tự động và lệnh chạy tệp seed dữ liệu để khởi tạo tài khoản Admin.
3. Cung cấp các kịch bản test chi tiết bằng lệnh `curl` có kèm theo giải thích cụ thể:
   - **Kịch bản 1:** Đăng nhập tài khoản Admin lấy JWT Token.
   - **Kịch bản 2:** Thêm mới một sản phẩm vỏ xe có cấu hình `minStock = 5` và `maxStock = 50`.
   - **Kịch bản 3:** Kiểm tra API Cảnh báo tồn kho xem sản phẩm vừa tạo có bị hiển thị cảnh báo đỏ không (vì lúc mới tạo tồn kho bằng 0, nhỏ hơn minStock).
   - **Kịch bản 4:** Giả lập thao tác nhân viên quét mã QR từ điện thoại bằng cách gửi request lên endpoint `/warehouse/scan`.
   - **Kịch bản 5:** Tạo lệnh gọi Combo Ép mâm xe nâng (`/inventory/assembly`), kiểm tra xem số lượng lốp và mâm tại vị trí ô kệ có tự động bị trừ đi đồng thời thông qua cơ chế transaction hay không.