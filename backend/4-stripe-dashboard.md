Nhiệm vụ: Hoàn thiện backend với hệ thống xử lý thanh toán trực tuyến Stripe, module Ép mâm xe nâng đặc thù, API Cảnh báo thông minh và dữ liệu Dashboard cho Quản lý.

YÊU CẦU THỰC HIỆN:
1. `OrderModule` & Stripe Integration:
   - `POST /orders/checkout-session`: Tiếp nhận mảng sản phẩm kèm số lượng từ giỏ hàng. Kiểm tra loại khách hàng để nhân bảng giá tương ứng từ `PriceMatrix` trước khi tạo link checkout Stripe.
   - `POST /orders/webhook`: Lắng nghe sự kiện thanh toán thành công để cập nhật trạng thái phiếu và trừ tồn kho tại bảng `StockLocation` theo đúng vị trí ô kệ chỉ định bốc hàng.
2. Module Nghiệp vụ "Ép Mâm Xe Nâng" (Assembly Service):
   - `POST /inventory/assembly`: Xử lý combo phối hợp lốp và mâm. Duyệt cổng giao dịch an toàn `$transaction` để tự động trừ 1 vỏ xe và 1 mâm xe tại ô kệ tương ứng, ghi vào bảng `AssemblyLog`.
3. API Cảnh báo thông minh & Dashboard Stats (Quyền ADMIN_MANAGER):
   - `GET /admin/dashboard-stats`: Thống kê doanh thu, khách hàng, định dạng biểu đồ (Recharts).
   - `GET /admin/inventory-alerts`: Quét toàn bộ bảng lốp xe, so sánh tồn kho thực tế với mức `minStock` để gửi cảnh báo đỏ.