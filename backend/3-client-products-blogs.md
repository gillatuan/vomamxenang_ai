Nhiệm vụ: Xây dựng các module cốt lõi cho REST API gồm `ClientModule`, `ProductModule`, `WheelRimModule` và `WarehouseModule` xử lý CRUD, đồng thời tối ưu hóa bộ lọc Mới/Cũ phục vụ hiển thị phân tầng ở Frontend.

YÊU CẦU THỰC HIỆN:
Mỗi module cần có đầy đủ Controller và Service, sử dụng Prisma để tương tác với DB (Các route ghi/xóa phải chặn bằng `JwtAuthGuard`):

1. `ClientModule` (Quản lý khách hàng): CRUD tiêu chuẩn, hỗ trợ phân loại nhóm đối tác (`RETAIL`, `WHOLESALE_L1`, `WHOLESALE_L2`).
2. `ProductModule` & `WheelRimModule` (Khai báo sản phẩm & Mâm xe):
   - `GET /products` và `GET /wheel-rims`: Phục vụ public công khai cho frontend. Phải hỗ trợ query parameter `condition` (Ví dụ: `GET /products?condition=NEW` hoặc `GET /products?condition=USED`) để frontend lọc nhanh nhóm hàng Mới hoặc Cũ.
   - `GET /products/:id` và `GET /wheel-rims/:id`: Endpoint lấy thông tin chi tiết (Detail) phục vụ trang chi tiết sản phẩm.
   - Các endpoint `POST`, `PATCH`, `DELETE` (Yêu cầu quyền ADMIN_MANAGER) để quản lý thuộc tính sản phẩm và cài đặt định mức `minStock`/`maxStock`.
3. `WarehouseModule` (Quản lý sơ đồ vị trí & Quét QR):
   - `GET /warehouse/map`: Trả về sơ đồ cấu trúc ô kệ kho.
   - `POST /warehouse/scan`: Nhận mã QR chuỗi rút gọn, tìm nhanh vị trí thực tế của lốp/mâm trong kho.