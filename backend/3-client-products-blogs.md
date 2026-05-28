Nhiệm vụ: Xây dựng các module cốt lõi cho REST API gồm `ClientModule`, `ProductModule`, `WheelRimModule` và `WarehouseModule` xử lý CRUD và đồng bộ vị trí kho thực tế.

YÊU CẦU THỰC HIỆN:
Mỗi module cần có đầy đủ Controller và Service, sử dụng Prisma để tương tác với DB (Tất cả endpoint ghi/xóa phải được bảo vệ bởi `JwtAuthGuard`):

1. `ClientModule` (Quản lý khách hàng):
   - Xử lý các endpoint CRUD tiêu chuẩn. Hỗ trợ phân loại nhóm khách hàng (`RETAIL`, `WHOLESALE_L1`, `WHOLESALE_L2`) khi tạo mới để phục vụ áp giá sỉ tự động.

2. `ProductModule` & `WheelRimModule` (Khai báo sản phẩm & Mâm xe):
   - `GET /products` và `GET /wheel-rims`: Public công khai cho frontend cửa hàng thương mại điện tử, cho phép lọc theo thông số, kích thước.
   - Các endpoint `POST`, `PATCH`, `DELETE` (Yêu cầu quyền ADMIN_MANAGER): Cho phép khai báo thông tin kỹ thuật, thiết lập định mức `minStock` và `maxStock` cho vỏ xe nâng để kích hoạt hệ thống cảnh báo.

3. `WarehouseModule` (Quản lý sơ đồ vị trí & Quét QR):
   - `GET /warehouse/map`: Trả về toàn bộ danh sách Kho -> Khu vực (Zone) -> Ô kệ (Slot) kèm danh sách sản phẩm và số lượng đang nằm tại ô đó để render sơ đồ kho dạng Grid trực quan.
   - `POST /warehouse/scan`: Nhận vào một mã QR chuỗi rút gọn (Ví dụ: `SKU:VX6009NX`) từ camera điện thoại gửi lên, thực hiện tìm kiếm nhanh xem sản phẩm này đang nằm tại chính xác các vị trí ô kệ nào trong kho và số lượng tương ứng, trả về dữ liệu vị trí được highlight nhanh cho frontend.