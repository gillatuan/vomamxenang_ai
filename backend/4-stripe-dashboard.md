Nhiệm vụ: Hoàn thiện backend với hệ thống xử lý thanh toán trực tuyến Stripe, module Ép mâm xe nâng đặc thù, API Cảnh báo thông minh và dữ liệu Dashboard cho Quản lý.

YÊU CẦU THỰC HIỆN:
1. `OrderModule` & Stripe Integration:
   - `POST /orders/checkout-session`: Sinh URL thanh toán Stripe. Tự động kiểm tra loại khách hàng để nhân bảng giá tương ứng từ `PriceMatrix`.
   - `POST /orders/webhook`: Lắng nghe sự kiện thanh toán thành công để cập nhật trạng thái phiếu và trừ tồn kho tại bảng `StockLocation` theo đúng vị trí ô kệ chỉ định.
2. Module Nghiệp vụ "Ép Mâm Xe Nâng" (Assembly Service):
   - Tạo endpoint `POST /inventory/assembly` xử lý kết hợp lốp và mâm. Sử dụng Prisma `$transaction` để tự động trừ 1 vỏ xe và 1 mâm xe tại ô kệ tương ứng, đồng thời ghi vào bảng `AssemblyLog`.
3. API Cảnh báo thông minh & Dashboard Stats (Quyền ADMIN_MANAGER):
   - `GET /admin/dashboard-stats`: Aggregate doanh thu, số khách hàng, và định dạng chart.
   - `GET /admin/inventory-alerts`: Quét toàn bộ bảng lốp xe, so sánh tổng số tồn kho với mức `minStock` để cảnh báo mã lốp thiếu hụt.