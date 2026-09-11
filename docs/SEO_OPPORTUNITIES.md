# SEO opportunities — dữ liệu thực 2026-09-11

## Inventory

17 Product public (16 TIRE, 1 SERVICE), 5 Post public, 1 WheelRim và 0 Category kho. Category kho không được biến thành trang SEO giả.

### Brand

| Giá trị | Số sản phẩm |
|---|---:|
| DUNLOP | 1 |
| TIRON | 1 |
| SUCCESS | 1 |
| BRIDGESTONE | 1 |
| Chưa ghi nhận | 4 |
| SOLITECH | 1 |
| YOKOHAMA | 1 |
| MASAI | 1 |
| MR.SOLID | 1 |
| PHOENIX | 1 |
| DEESTONE | 1 |
| NEXEN | 1 |
| KOMACHI | 1 |
| CASUMINA | 1 |
### Size

| Giá trị | Số sản phẩm |
|---|---:|
| 7.00-12 | 6 |
| 6.00-9 | 8 |
| Chưa ghi nhận | 1 |
| 5.00-8 | 2 |
### Product Type

| Giá trị | Số sản phẩm |
|---|---:|
| TIRE | 16 |
| SERVICE | 1 |
### Tire Type

| Giá trị | Số sản phẩm |
|---|---:|
| PNEUMATIC | 6 |
| SOLID | 9 |
| Chưa ghi nhận | 1 |
| NON_MARKING | 1 |
### Condition

| Giá trị | Số sản phẩm |
|---|---:|
| NEW_100 | 15 |
| Chưa ghi nhận | 1 |
| USED | 1 |

### Wheel Rim Size / Bolt Holes

| Size | Số lỗ | Brand | Dòng xe ghi nhận |
|---|---:|---|---|
| 6.50-10 | 5 | OEM | Toyota, Komatsu — cần đối chiếu model/cấu hình |

## Ưu tiên

| Priority | Cơ hội / vấn đề | Hành động |
|---|---|---|
| HIGH | Homepage chưa nhấn mạnh chủ đề tổng | Title/H1/mô tả tự nhiên về vỏ mâm; giữ thương hiệu hiện tại |
| HIGH | Thiếu nhánh lốp/mâm trong kiến trúc | Tạo 3 landing page có danh mục thực và hướng dẫn khác nhau |
| HIGH | WheelRim có API public nhưng chưa có trang chi tiết | Tạo `/mam-xe-nang/rim-1`, title/schema từ dữ liệu thực |
| HIGH | Breadcrumb JSON-LD chưa có UI tương ứng | Dùng chung danh sách crumbs cho UI và schema |
| HIGH | Arbitrary filters có nguy cơ trùng index | Canonical sạch + noindex,follow; không chặn _next |
| MEDIUM | Staff bị cảnh báo thiếu keyword dù đã có tên sản phẩm | Suy ra topic/fallback metadata từ thuộc tính; override vẫn tùy chọn |
| MEDIUM | Metadata trùng | Giữ override đã duyệt; SERP preview giúp biên tập sửa, không tự rewrite DB |
| MEDIUM | 5 bài chưa có featured image trong audit 2026-09-10 | Admin bổ sung ảnh thật và alt, không tạo ảnh/spec giả |
| MEDIUM | Liên kết mô tả còn thiếu | Category/breadcrumb/related nav tạo đường dẫn thật; editor quản lý nội dung |
| LOW | Size/brand landing pages | Chưa tạo riêng: mỗi brand chỉ có 1 sản phẩm; cùng size chưa đủ để biện minh nội dung mới |
| LOW | Location pages | Chưa có dữ liệu dịch vụ theo địa bàn đủ riêng biệt; không tạo |

## Technical baseline

Audit production 2026-09-10: 26 URL, 0 Critical, 0 High, 41 Medium, 5 Low; 0 orphan trong HTML server. Đó là baseline trước mở rộng, không phải dữ liệu Google index/ranking. Hai description trùng và các thiếu sót nội dung cần biên tập duyệt. Trang danh mục mới bổ sung navigation; cần kiểm tra lại trên build mới.

## Những trang không tạo

- Không tạo Maxam, Advance, Solideal, Trelleborg, Westlake, L-GUARD vì không có sản phẩm trong DB đọc được.
- Không tạo vỏ 4.00-8, 6.50-10, 8.25-15; chỉ 5.00-8, 6.00-9, 7.00-12 có trong Product TIRE.
- Không tạo mâm 6/8 lỗ hoặc trang model xe/tải trọng vì chỉ có mâm 5 lỗ và thông tin hãng tổng quát.
- Không tạo standalone trang giá/brand/size gần trùng; tái sử dụng category và detail.
- Không công bố author, chứng nhận, nguồn gốc, tuổi thọ, độ bám, tải trọng hoặc stock khi không có dữ liệu xác minh.

## Performance

Trang chủ đề và chi tiết mâm là Server Components; FAQ native details không cần state/JS riêng. Ảnh mới ở danh mục dùng Next/Image, sizes và kích thước ổn định; remote URLs được giữ, không rename asset. ProductImage hiện tại có khung kích thước, đã đặt ảnh detail tải ưu tiên và listing lazy. Chưa có đo Core Web Vitals ngoài thực địa nên không công bố điểm LCP/CLS/INP giả.
