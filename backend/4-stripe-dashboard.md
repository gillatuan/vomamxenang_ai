Nhiệm vụ: Hoàn thiện backend với hệ thống xử lý thanh toán trực tuyến Stripe, module Ép mâm xe nâng đặc thù, API Cảnh báo thông minh và dữ liệu Dashboard cho Quản lý.

YÊU CẦU THỰC HIỆN:
1. `OrderModule` & Stripe Integration:
   - `POST /orders/checkout-session`: Sinh URL thanh toán Stripe dựa trên giỏ hàng lốp/mâm từ frontend. Khi tính tiền, hệ thống phải tự động kiểm tra loại khách hàng để nhân bảng giá tương ứng từ `PriceMatrix`.
   - `POST /orders/webhook`: Lắng nghe sự kiện `checkout.session.completed` từ Stripe để chuyển trạng thái đơn hàng sang "PAID". Tự động trừ số lượng tồn kho `quantity` tại bảng `StockLocation` theo đúng vị trí ô kệ được chỉ định bốc hàng.

2. Module Nghiệp vụ "Ép Mâm Xe Nâng" (Assembly Service):
   - Tạo endpoint `POST /inventory/assembly`: Xử lý combo phối hợp lốp và mâm. Nhân viên kho nhập vào: `productId` + `wheelRimId` + `quantity` + `pressingFee`.
   - Logic xử lý: Hệ thống dùng Prisma `$transaction` để tự động trừ 1 vỏ xe nâng và 1 mâm xe tại vị trí ô kệ tương ứng, đồng thời ghi nhận vào bảng `AssemblyLog`.

3. API Cảnh báo thông minh & Dashboard Stats (Protected - Quyền ADMIN_MANAGER):
   - `GET /admin/dashboard-stats`: Tính toán tổng doanh thu từ các đơn hàng đã thanh toán (PAID), tổng số khách hàng, và định dạng dữ liệu doanh thu theo tháng để vẽ biểu đồ cột/tròn (Recharts).
   - `GET /admin/inventory-alerts`: Quét toàn bộ bảng lốp xe, so sánh tổng số lượng tồn kho thực tế với mức `minStock`. Trả về danh sách tất cả các mã lốp đang bị thiếu hụt so với định mức để hiển thị cảnh báo đỏ trên trang chủ quản lý.