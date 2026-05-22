Bạn là một chuyên gia kiến trúc phần mềm và hệ thống ERP. Tôi đang phát triển một hệ thống quản lý kho cho mô hình kinh doanh "Vỏ xe nâng" (Forklift Tyres) bằng NestJS và Prisma. 

Hãy thiết kế cơ sở dữ liệu (Prisma Schema), các thực thể (Entities) và logic nghiệp vụ đáp ứng trọn vẹn các yêu cầu quản lý nhập/xuất, phân loại và định vị hàng hóa sau đây:

1. QUẢN LÝ PHÂN LOẠI VỎ XE (Product Catalog):
- Vỏ xe nâng có các thuộc tính đặc thù cần quản lý: Kích thước/Thông số kỹ thuật (ví dụ: 6.00-9, 7.00-12, 21x8-9...), Thương hiệu (Bridgestone, Michelin, Dunlop...), Loại vỏ (Vỏ đặc - Solid, Vỏ hơi - Pneumatic, Vỏ đặc trắng - Non-marking...), Loại mâm (Mâm thường, Mâm gài - Lip/Click), Xuất xứ, và Trạng thái (Mới 100%, Đã qua sử dụng/Lướt).

2. QUẢN LÝ ĐỊNH VỊ KHO (Warehouse Location & Tagging):
- Hệ thống cần quản lý sơ đồ kho theo cấu trúc rõ ràng để dễ tìm kiếm: Kho (Warehouse) -> Khu vực/Dãy (Zone/Aisle) -> Kệ/Hàng (Row/Rack) -> Tầng/Ô (Level/Slot).
- Mỗi vị trí lưu trữ sẽ có một Mã định vị (Location Code, ví dụ: K1-A2-R3: Kho 1, Dãy A2, Kệ 3).
- Cần có cơ chế "Đánh dấu" (Tagging/Barcode/QR Code) cho từng lô hàng hoặc từng chiếc vỏ xe để khi quét hoặc tìm kiếm trên phần mềm là biết ngay nó đang nằm ở chính xác ô nào, hàng nào.

3. QUẢN LÝ NHẬP / XUẤT KHO (Inventory Transactions):
- Phiếu Nhập Kho (Goods Receipt): Ghi lại thông tin Nhà cung cấp, ngày nhập, danh sách vỏ xe, số lượng, đơn giá nhập, và vị trí chỉ định lưu trữ trong kho khi nhập vào.
- Phiếu Xuất Kho (Goods Issue): Ghi lại thông tin Khách hàng (hoặc xuất nội bộ), ngày xuất, lý do xuất, danh sách vỏ xe, số lượng, và tự động trừ số lượng tại đúng vị trí kho đã xuất.
- Hệ thống phải quản lý được Tồn kho theo từng vị trí (Inventory by Location) chứ không chỉ tồn kho tổng (ví dụ: Vỏ đặc 6.00-9 Nexen đang có 10 cái ở Kệ A và 5 cái ở Kệ B).

YÊU CẦU ĐẦU RA:
1. Hãy viết file `schema.prisma` hoàn chỉnh bao gồm các model: Product, Category, Warehouse, Location, Stock (Tồn kho theo vị trí), InventoryLog (Lịch sử nhập xuất), Receipt (Phiếu nhập), Issue (Phiếu xuất). Có đầy đủ quan hệ (relations) giữa các bảng.
2. Gợi ý các API endpoint chính cần có cho module Warehouse và Inventory này bằng NestJS.