# Báo cáo mở rộng SEO — 2026-09-11

## Vấn đề và kết quả

Trước thay đổi, sitemap có 26 URL, chưa có nhánh vỏ/mâm hoặc trang chi tiết WheelRim. Homepage chưa thể hiện rõ chủ đề tổng; breadcrumb schema chưa có navigation tương ứng; trang lọc thiếu quy tắc noindex. Keyword map thiên về tên nội dung, thiếu phân tầng chủ đề và tách dữ liệu vỏ/mâm.

Đã tổ chức homepage “vỏ mâm xe nâng” → `/vo-xe-nang` → `/lop-dac-xe-nang` → sản phẩm; nhánh `/mam-xe-nang` → `/mam-xe-nang/rim-1`. Ba trang chủ đề có mô tả riêng, danh mục thực, hướng dẫn, FAQ hiển thị và liên kết bài viết. Các URL Product/Post cũ được giữ.

## Keyword và nội dung

- Nhóm tổng: vỏ mâm xe nâng, vỏ và mâm xe nâng.
- Nhóm vỏ: vỏ/lốp xe nâng, vỏ đặc/lốp đặc, vỏ hơi/lốp hơi; size và thương hiệu từ sản phẩm thực.
- Nhóm mâm: mâm bánh xe nâng; size 6.50-10, 5 lỗ. Toyota/Komatsu chỉ là thông tin ghi trên mâm, không suy ra tương thích của lốp.
- Nhóm mua hàng: giá/mua/nhà cung cấp, dùng cùng trang chủ đề có hướng dẫn hỏi giá.
- Nhóm hướng dẫn: chọn vỏ, đọc size, kiểm tra mâm, vận hành/bảo dưỡng; giữ và nâng cấp 5 bài hiện có theo kế hoạch.
- Bốn intent được phân biệt: TRANSACTIONAL, COMMERCIAL INVESTIGATION, INFORMATIONAL, NAVIGATIONAL. URL bị noindex không được đề xuất làm mục tiêu keyword.

[SEO_KEYWORD_MAP.md](SEO_KEYWORD_MAP.md) có bản đồ URL/từ khóa. [SEO_CONTENT_PLAN.md](SEO_CONTENT_PLAN.md) có 35 đề cương với 30 URL bài viết riêng biệt, intent, ưu tiên, dàn ý, liên kết và sản phẩm/danh mục liên quan. Chưa tự xuất bản các bài trong kế hoạch.

## Metadata, schema và liên kết

Homepage có title/description/H1 theo chủ đề tổng. Product có fallback metadata dựa trên tên, loại, size, brand; override đã nhập được giữ. WheelRim có metadata từ trường thực và đường dẫn ID ổn định vì model hiện chưa có slug/alias; không tạo URL thay đổi theo size hoặc số lỗ.

Admin có SERP preview, cảnh báo độ dài mềm và lựa chọn index/noindex. Không bắt buộc nhân viên điền primaryKeyword.

Schema: Organization được giữ, bổ sung WebSite; CollectionPage/ItemList cho chủ đề; Product cho mâm; Product hiện có chỉ thêm Offer nếu giá thực lớn hơn 0; BlogPosting có mainEntityOfPage. Không thêm availability, rating, review, author hoặc thông số không có nguồn dữ liệu. Breadcrumb UI và JSON-LD dùng cùng danh sách.

Header/homepage dẫn tới hai nhánh vỏ/mâm. Trang chủ đề dẫn tới sản phẩm và hướng dẫn. Product/Post có breadcrumb và navigation danh mục, giữ gợi ý nội dung liên quan hiện có. Không tự sửa nội dung mô tả đã lưu trong database.

## Sitemap, robots và hiệu năng

Sitemap tăng từ 26 lên 30 URL theo dữ liệu hiện tại, gồm 3 chủ đề và 1 mâm. Chủ đề chỉ đưa vào sitemap khi có sản phẩm indexable; lastModified chỉ lấy ngày thực có sẵn. Trang lọc/tìm kiếm/sắp xếp danh mục và blog có canonical sạch, noindex,follow. Robots loại khu vực admin/auth/checkout/API/account/cart/login và không chặn `_next`.

Trang mới render trên server; FAQ dùng native details. Ảnh danh mục mới có sizes/kích thước; ảnh Product detail tải ưu tiên, ảnh listing lazy và decoding async. Không thay tên tài sản ảnh. Chưa đo Core Web Vitals ngoài thực địa.

## Các trang chưa tạo

Chưa tạo hàng loạt trang brand/size/location hoặc mâm 6/8 lỗ, tải trọng, model xe. Dữ liệu hiện có chưa đủ để viết nội dung riêng hoặc xác nhận tương thích. Giữ category/detail phù hợp, không tạo trang gần trùng. Xem thống kê và khoảng trống dữ liệu trong [SEO_OPPORTUNITIES.md](SEO_OPPORTUNITIES.md).

## Kiểm tra

- Frontend `yarn build`: PASS, gồm lint và TypeScript.
- Frontend `node --test tests/*.test.cjs`: 16/16 PASS.
- Backend `yarn build`, `yarn test:seo`: PASS.
- HTTP bản build dùng API public thực: 30/30 URL HTTP 200, một H1, canonical đúng, JSON-LD parse được, 30 đích nội bộ không hỏng.
- Product/Post ID → alias 308: PASS.
- FAQ/breadcrumb/category schema, noindex trang lọc, robots và mâm không tồn tại 404: PASS.
- Canonical local giữ origin local theo cấu hình; phải xác nhận riêng origin production sau triển khai.
- Không thay schema database; không có migration mới hoặc yêu cầu API key cho phần mở rộng này.

Số URL sitemap không phải số trang Google đã index. Báo cáo không đưa số volume/ranking hoặc cam kết thời gian index.

## Tệp tạo và sửa

Tạo: `frontend/src/lib/seo/{keyword-utils,product-seo,category-seo,rim-seo,structured-data}.ts`; `frontend/src/components/{SeoBreadcrumbs,TopicLandingPage}.tsx`; 3 route chủ đề và route mâm `[id]`; `frontend/tests/keyword-seo{.test,-http}.cjs`; 4 tài liệu `docs/SEO_*.md` của đợt này.

Sửa: `frontend/src/lib/{public-seo,api-client}.ts`; homepage, Product/Post listing/detail; header, related navigation, ProductImage, ContentSeoFields; sitemap/robots; admin SEO page; `backend/src/seo/{seo-analysis,seo.service}.ts` và `backend/test/seo.spec.ts`.
