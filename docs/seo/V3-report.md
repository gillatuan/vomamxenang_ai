# V3 SEO report — 2026-09-10

Production đã triển khai commit `9738816`; backend và frontend đều Ready. Còn live AI discovery/outreach phụ thuộc khóa OpenAI hợp lệ.

## SEO Audit

26/26 trang đã kiểm tra, không có lỗi fetch. Critical: **0**; High: **0**; Medium: **41**; Low: **5**.

So với baseline: High giảm từ 15 xuống 0; không còn orphan trong HTML server, thiếu H1 hoặc thiếu Breadcrumb schema. Các cảnh báo còn lại cần duyệt biên tập: 22 nội dung chưa chọn primary keyword; 14 trang thiếu incoming link trong mô tả; 1 nội dung ngắn; 1 bài thiếu internal/product link; 2 meta descriptions trùng; 5 bài chưa có ảnh.

[Audit chi tiết có timestamp, URL và bằng chứng](./V3-production-audit-2026-09-10.json).

## Products

- Total audited: 17.
- Missing title/meta: 0; missing primary keyword: 17.
- Missing internal links trong mô tả: 0.
- Orphan products trong HTML server: 0.
- Chưa có contextual incoming: 11.

## Posts

- Total audited: 5.
- Missing title/meta: 0; missing primary keyword: 5.
- Missing product/internal links trong mô tả: 1.
- Orphan posts trong HTML server: 0.
- Chưa có contextual incoming: 3.

## Internal Links

79 suggestions đã lưu production, cần admin review. SSR danh sách có 17 product links và 5 blog links. Related navigation theo size/brand/tire type/topic đã triển khai, gồm sản phẩm và hướng dẫn liên quan.

Không tự apply đề xuất vào mô tả. Admin duyệt, sửa trong editor và lưu; audit sau đó xác nhận IMPLEMENTED khi thấy link thật. Hash SHA-256 nội dung, slug và SEO của toàn bộ Product/Post trùng với snapshot trước triển khai: `7a2e561cbb3eb43a32062ebf2cc9902bdeb99bfb1a2fc2839ef79961fccf226e`.

## Backlink Research

10 cơ hội có evidence, 6 Việt Nam và 4 quốc tế; 9 domains. Forkliftaction có 2 kênh khác nhau (forum và editorial).

Forums: 1; directories: 1; B2B: 2; guest/expert contribution: 1; industry news: 3; associations: 2.

Tất cả cần admin duyệt; không có email/bài đăng được gửi, không có backlink LIVE được xác minh. Metrics chưa có provider giữ UNKNOWN/null. Luồng tạo outreach chỉ cho cơ hội đã APPROVED; chờ khóa AI hợp lệ để kiểm tra live generation.

## Top Backlink Opportunities

### Trang Vàng Việt Nam

- Domain: yellowpages.vn
- URL/evidence: [Nguồn công khai](https://www.yellowpages.vn/)
- Type: BUSINESS_DIRECTORY; relevance: 70/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Danh bạ công khai có ngành cơ khí, thiết bị công nghiệp và bốc xếp bằng xe nâng; có đăng ký hồ sơ miễn phí, qua ban biên tập.
- Suggested target: https://www.vomamxenang.com/
- Suggested approach: Đăng hồ sơ doanh nghiệp thật sau khi đối chiếu tên, địa chỉ, điện thoại và ngành nghề. Chỉ dùng hồ sơ cơ bản; không mua liên kết.
- Cần xác minh: Các website Trang Vàng cùng hệ thống được gộp thành một cơ hội. Chưa xác minh profile link hoặc rel.

### Hiệp hội Doanh nghiệp dịch vụ Logistics Việt Nam

- Domain: vla.com.vn
- URL/evidence: [Nguồn công khai](https://vla.com.vn/danh-ba-hoi-vien/)
- Type: ASSOCIATION; relevance: 65/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: VLA có danh bạ hội viên công khai; điều lệ nêu ngành nghề, hồ sơ và điều kiện gia nhập.
- Suggested target: https://www.vomamxenang.com/about
- Suggested approach: Trao đổi điều kiện hội viên hoặc hoạt động chuyên môn nếu phù hợp tư cách doanh nghiệp. Không gia nhập chỉ để lấy link.
- Cần xác minh: Tư cách hội viên, chi phí, khả năng đặt URL và rel cần xác minh. Danh bạ không chứng minh được chấp nhận.

### HUBA · đăng ký hội viên

- Domain: huba.vn
- URL/evidence: [Nguồn công khai](https://huba.vn/hoi-vien/dang-ky-hoi-vien)
- Type: ASSOCIATION; relevance: 50/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Trang đăng ký hội viên có biểu mẫu thông tin doanh nghiệp, lĩnh vực quan tâm và nghĩa vụ hội phí; website có danh sách hội viên doanh nghiệp.
- Suggested target: https://www.vomamxenang.com/about
- Suggested approach: Kiểm tra tư cách hội viên và giá trị kết nối doanh nghiệp tại TP.HCM. Hỏi về hồ sơ công khai nếu tham gia có lý do kinh doanh thật.
- Cần xác minh: Thông tin hội phí trên biểu mẫu có thể cũ; xác nhận với HUBA. Chưa xác minh liên kết ngoài.

### Vietnam Logistics Review

- Domain: vlr.vn
- URL/evidence: [Nguồn công khai](https://vlr.vn/)
- Type: NEWS; relevance: 75/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Website đăng nội dung logistics, chuỗi cung ứng và công nghệ; có thông tin liên hệ công khai cuối trang.
- Suggested target: https://www.vomamxenang.com/blog/chon-lop-dac-hay-lop-hoi-cho-xe-nang
- Suggested approach: Đề xuất góc nhìn thực tế về bảo trì bánh xe trong kho, kèm ảnh và số liệu công việc đã được khách hàng cho phép. Hỏi ban biên tập trước khi chuẩn bị bài.
- Cần xác minh: Có liên hệ không đồng nghĩa nhận guest post. Chưa xác minh chính sách dẫn nguồn hoặc rel.

### Sàn Giao dịch Công nghệ TP.HCM

- Domain: techport.vn
- URL/evidence: [Nguồn công khai](https://techport.vn/)
- Type: B2B_MARKETPLACE; relevance: 70/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Trang chủ có mục thiết bị chào bán, nhà cung ứng, yêu cầu tìm mua và kết nối cung cầu công nghệ.
- Suggested target: https://www.vomamxenang.com/products/dich-vu-thay-lop-ep-mam-xe-nang
- Suggested approach: Hỏi sàn về điều kiện giới thiệu dịch vụ kỹ thuật/thiết bị phù hợp. Chuẩn bị hồ sơ năng lực và thông số thực tế; chỉ đăng khi sàn xác nhận phù hợp.
- Cần xác minh: Sàn tập trung công nghệ; không mặc định mọi sản phẩm lốp được chấp nhận. Chưa xác minh đăng ký và URL ngoài.

### Hatex · hướng dẫn gian hàng

- Domain: hatex.vn
- URL/evidence: [Nguồn công khai](https://www.hatex.vn/huong-dan/cach-dang-san-pham-tren-hatexvn-cho-nguoi-moi-bat-dau.html)
- Type: B2B_MARKETPLACE; relevance: 70/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Hướng dẫn công khai mô tả đăng ký thành viên, thiết lập gian hàng và đăng sản phẩm.
- Suggested target: https://www.vomamxenang.com/products/lop-dac-xe-nang-6-00-9-cho-kho-xuong
- Suggested approach: Kiểm tra lại hướng dẫn và điều khoản hiện hành; đăng đúng sản phẩm hiện có nếu phù hợp danh mục của sàn.
- Cần xác minh: Bằng chứng từ kết quả tìm kiếm có crawl gần đây; mở trực tiếp bằng công cụ web bị lỗi. Cần kiểm tra thủ công trước khi duyệt; hướng dẫn xuất bản nhiều năm trước.

### Forkliftaction · thảo luận chọn lốp

- Domain: forkliftaction.com
- URL/evidence: [Nguồn công khai](https://www.forkliftaction.com/forum/how-to-decide-on-the-best-tyre-for-your-forklift.aspx?q=136418)
- Type: FORUM; relevance: 75/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Có thảo luận chuyên về lựa chọn lốp xe nâng trong mục Safety & Training, bài hiển thị ngày 18/06/2024. Website có chức năng đăng thảo luận/trả lời.
- Suggested target: https://www.vomamxenang.com/blog/chon-lop-dac-hay-lop-hoi-cho-xe-nang
- Suggested approach: Đọc quy tắc diễn đàn; trả lời kỹ thuật có ích trong thảo luận còn hoạt động. Chỉ dẫn nguồn nếu giúp người đọc, không khơi lại bài cũ để quảng cáo.
- Cần xác minh: Ngày của thảo luận đã thấy không phải ngày hoạt động mới nhất toàn forum. Cần bản tiếng Anh được duyệt; rel và external-link policy UNKNOWN.

### Forkliftaction · đóng góp chuyên gia

- Domain: forkliftaction.com
- URL/evidence: [Nguồn công khai](https://www.forkliftaction.com/news/editorial-calendar.aspx)
- Type: GUEST_POST; relevance: 75/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Lịch biên tập mời người có chuyên môn hỏi cách đóng góp cho các chuyên đề, gồm giải pháp an toàn và quản lý đội xe.
- Suggested target: https://www.vomamxenang.com/blog/kiem-tra-mam-xe-nang-truoc-khi-ep-lop
- Suggested approach: Đề xuất checklist kiểm tra mâm có ảnh công việc thực tế để biên tập đánh giá. Hỏi phạm vi chuyên đề và chính sách trích dẫn; không đề nghị mua link.
- Cần xác minh: Lời mời đóng góp chuyên gia không bảo đảm được xuất bản hoặc có backlink. Cần bản tiếng Anh và xác minh kỹ thuật.

### Logistics Business · editorial enquiries

- Domain: logisticsbusiness.com
- URL/evidence: [Nguồn công khai](https://logisticsbusiness.com/media-kit)
- Type: NEWS; relevance: 60/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Trang media kit phân biệt liên hệ biên tập với quảng cáo; chủ đề biên tập được chọn theo diễn biến ngành.
- Suggested target: https://www.vomamxenang.com/blog/chon-lop-dac-hay-lop-hoi-cho-xe-nang
- Suggested approach: Gửi đề xuất biên tập về điều kiện nền kho và lựa chọn lốp, sử dụng bằng chứng vận hành được xác minh. Không chọn gói quảng cáo để mua backlink.
- Cần xác minh: Email hiện bị che trong bản đọc; không suy đoán địa chỉ. Khả năng nhận bài ngoài và rel chưa xác minh.

### DC Velocity · editorial staff

- Domain: dcvelocity.com
- URL/evidence: [Nguồn công khai](https://www.dcvelocity.com/contact/staff)
- Type: NEWS; relevance: 60/100 (đánh giá ưu tiên chủ đề, không phải DA/DR).
- Evidence: Trang liên hệ công khai liệt kê bộ phận biên tập của ấn phẩm về logistics và hoạt động phân phối.
- Suggested target: https://www.vomamxenang.com/blog/doc-thong-so-lop-xe-nang-truoc-khi-thay
- Suggested approach: Hỏi biên tập viên phù hợp về bài hướng dẫn nhận diện thông số và giới hạn tương thích, kèm nguồn từ nhà sản xuất. Chỉ gửi bản nháp sau khi có phản hồi.
- Cần xác minh: Danh sách biên tập không chứng minh nhận guest post hoặc cho link; cần duyệt thủ công.

## Production

- Frontend: `frontend-kz1cgur5r-gillatuans-projects.vercel.app` — Ready, đúng commit V3.
- Backend: `vomamxenang-ai-backend-agc142p3e-gillatuans-projects.vercel.app` — Ready, đúng commit V3.
- Migration: `20260909000100_seo_workbench`.
- Seed: `009-seo-opportunities`; SeedHistory xác nhận 2026-09-10T15:50:01.697Z.
- CI/CD: Vercel đã chạy migration → seed → build. Tests frontend/backend đã được thêm vào GitHub workflow; không suy đoán trạng thái GitHub Actions riêng.

## Validation

- Frontend lint/typecheck/build: PASS khi chuẩn bị commit.
- Backend typecheck/build: PASS khi chuẩn bị commit.
- Frontend tests: 11 PASS; backend SEO/verification/discovery policy tests và production seed runner PASS.
- Local API permissions: anonymous 401, STOREKEEPER 403, ADMIN_MANAGER 200.
- Production SEO API: anonymous 401.
- Production `/products` và `/blog`: HTTP 200, đúng 1 H1 mỗi trang.
- Production sitemap: HTTP 200, đủ 26 URL.
- Production audit: đủ 26 trang, canonical/JSON-LD/H1 kiểm tra không còn lỗi High/Critical.
- Product/Post content integrity: SHA-256 MATCH trước/sau triển khai.
- Live AI: cả khóa `.env.local` và `.env.production` đã kiểm tra đều HTTP 401. Không đưa khóa không hợp lệ lên Vercel. Đã yêu cầu người dùng thay khóa an toàn trong local, không gửi qua chat.

## Next Actions

**P0:** Cung cấp OPENAI_API_KEY hợp lệ qua local; kiểm tra bằng truy vấn public; cấu hình trên Vercel backend và redeploy; xác minh live discovery/outreach bằng fixture staging, không duyệt thay admin trên production.

**P1:** Admin duyệt primary keyword, 79 internal-link suggestions và 10 cơ hội backlink; bổ sung ảnh thật và cải thiện nội dung còn thiếu. Giữ luồng preview → approve → save.

**P2:** Triển khai [linkable asset plan](./V3-link-plan.md) sau khi thông số kỹ thuật được xác minh; theo dõi backlinks bằng Verify; tích hợp GSC API ở V4 khi được yêu cầu.
