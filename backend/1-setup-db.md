Nhiệm vụ: Khởi tạo dự án NestJS và thiết kế file `schema.prisma` hoàn chỉnh cho hệ thống Quản lý kho & Kinh doanh Vỏ xe nâng (Forklift Tyres). Hệ thống phải quản lý được 4 nhóm hàng: Vỏ Mới, Vỏ Cũ, Mâm Mới, Mâm Cũ, đồng thời hỗ trợ bình luận (Comment), danh sách yêu thích (Favourite), định vị kho sâu, quy trình ép mâm và bảng giá sỉ B2B.

YÊU CẦU THỰC HIỆN:
1. Cung cấp các lệnh terminal để khởi tạo một dự án NestJS mới trong thư mục hiện tại và cài đặt các gói cần thiết: Prisma CLI, Prisma Client.
2. Thiết kế file `schema.prisma` hoàn chỉnh với các Model và enum phân loại chi tiết:

- User: id, email, password, role (ADMIN_MANAGER, STOREKEEPER), createdAt
- Customer: id, name, email, phone, company, type (RETAIL, WHOLESALE_L1, WHOLESALE_L2), notes, createdAt
- Product (Vỏ xe nâng): id, sku (Unique), size (Thông số), brand, type (SOLID, PNEUMATIC, NON_MARKING), rimType (LIP, CLICK), condition (NEW, USED), minStock, maxStock, imageUrl, description, createdAt
- WheelRim (Mâm xe nâng): id, sku (Unique), size, boltHoles (Số lỗ bu-lông), condition (NEW, USED), compatibleModels, stock, createdAt
- PriceMatrix (Bảng giá B2B): id, productId, customerType (RETAIL, WHOLESALE_L1, WHOLESALE_L2), price
- Warehouse (Kho): id, name, address
- Location (Vị trí ô kệ): id, warehouseId, zone, rack, slot, capacity, currentUsage (Mã tổng hợp: K1-ZA-R02-S01)
- StockLocation (Tồn kho thực tế tại ô kệ): id, productId (nullable), wheelRimId (nullable), locationId, quantity
- AssemblyLog (Nhật ký ép mâm): id, productId, wheelRimId, quantity, pressingFee, userId, createdAt
- Order (Đơn hàng/Phiếu xuất): id, code (Unique), customerId, totalAmount, status (PENDING, PAID, FAILED), stripeSessionId, createdAt
- OrderItem / TransactionDetail: id, orderId, productId (nullable), wheelRimId (nullable), locationId (Vị trí bốc hàng), quantity, price
- Post (Bài viết vlogging/SEO): id, title, slug (Unique), content, videoUrl, imageUrl, createdAt
- ProductComment: id, productId, userId, content, rating, createdAt
- PostComment: id, postId, userId, content, createdAt
- FavouriteProduct: id, productId, userId, createdAt

3. Thiết kế PrismaModule và PrismaService trong NestJS để inject kết nối database dễ dàng.