Nhiệm vụ: Khởi tạo dự án NestJS và thiết kế file `schema.prisma` hoàn chỉnh cho hệ thống Quản lý kho & Kinh doanh Vỏ xe nâng (Forklift Tyres), chạy trên môi trường Node.js và PostgreSQL. Hệ thống phải tích hợp cơ chế định vị kho sâu, quản lý lô tem QR, định mức tồn kho, quy trình ép mâm đặc thù và bảng giá sỉ B2B.

YÊU CẦU THỰC HIỆN:
1. Cung cấp các lệnh terminal để khởi tạo một dự án NestJS mới trong thư mục hiện tại và cài đặt các gói cần thiết: Prisma CLI, Prisma Client.
2. Thiết kế file `schema.prisma` hoàn chỉnh với các Model và quan hệ (Relations) sau:

- User: id, email, password, role (ADMIN_MANAGER, STOREKEEPER)
- Customer: id, name, email, phone, company, type (RETAIL, WHOLESALE_L1, WHOLESALE_L2), notes, createdAt
- Product (Vỏ xe): id, sku (Unique), size (Thông số), brand, type (SOLID, PNEUMATIC, NON_MARKING), rimType (LIP, CLICK), condition (NEW, USED), minStock, maxStock, imageUrl, description
- PriceMatrix (Bảng giá B2B): id, productId, customerType (RETAIL, WHOLESALE_L1, WHOLESALE_L2), price
- WheelRim (Mâm xe): id, sku (Unique), size, boltHoles (Số lỗ bu-lông), compatibleModels, stock
- Warehouse (Kho): id, name, address
- Location (Vị trí ô kệ): id, warehouseId, zone, rack, slot, capacity, currentUsage (Mã vị trí tổng hợp: K1-ZA-R02-S01)
- StockLocation (Tồn kho thực tế tại ô kệ): id, productId (nullable), wheelRimId (nullable), locationId, quantity
- AssemblyLog (Nhật ký ép mâm): id, productId, wheelRimId, quantity, pressingFee, userId, createdAt
- Order (Đơn hàng/Phiếu xuất): id, code (Unique), customerId, totalAmount, status (PENDING, PAID, FAILED), stripeSessionId, createdAt
- OrderItem / TransactionDetail: id, orderId, productId (nullable), wheelRimId (nullable), locationId (Vị trí bốc hàng), quantity, price
- Post (Bài viết vlogging/SEO): id, title, content, videoUrl, createdAt

3. Thiết kế PrismaModule và PrismaService trong NestJS để các module khác có thể inject và sử dụng kết nối database dễ dàng.