Nhiệm vụ: Thiết kế trọn vẹn Luồng Giao diện Duyệt danh mục phân tầng theo yêu cầu kinh doanh: Tầng 1 (Phân loại Mới/Cũ) -> Tầng 2 (Danh sách hàng hóa) -> Tầng 3 (Trang chi tiết - Detail) bằng MaterialUI.

Yêu cầu giao diện & Luồng trải nghiệm (UX):

1. TẦNG 1: TRANG LỰA CHỌN TRẠNG THÁI (Condition Selection Page):
   - Thiết kế giao diện gồm 2 Tab lớn hoặc 2 Grid Card khổng lồ trực quan: "HÀNG MỚI 100%" (Sử dụng biểu tượng Huy hiệu/Mới) và "HÀNG ĐÃ QUA SỬ DỤNG / LƯỚT" (Sử dụng biểu tượng Hoàn trả/Tái chế).
   - Người dùng bấm vào một trong hai lựa chọn sẽ chuyển hướng hoặc lọc dữ liệu theo trạng thái đó.

2. TẦNG 2: DANH SÁCH SẢN PHẨM PHÂN LOẠI (Catalog View):
   - Sử dụng component `Tabs` của MUI để chia nhanh: "Vỏ Xe Nâng" và "Mâm Xe Nâng".
   - Hiển thị danh sách dạng Bảng (`Table`) hoặc dạng Lưới các thẻ (`Grid Card`) tùy thuộc vào loại thiết bị (PC hiển thị Table, Mobile hiển thị Card).
   - Mỗi sản phẩm hiển thị: Hình ảnh, Tên/Thông số kích thước (Size), Thương hiệu, Tình trạng (Mới/Lướt), Tồn kho thực tế. Có nút hiển thị "In mã QR" kích hoạt `Dialog` in ấn tem nhiệt 50x30mm.
   - Cho phép lọc nâng cao (`TextField`, `Select` của MUI) theo thương hiệu và kích thước.

3. TẦNG 3: TRANG CHI TIẾT SẢN PHẨM (Product Detail Page):
   - Khi người dùng click vào một dòng sản phẩm hoặc một Card ở Tầng 2, hệ thống điều hướng sang trang Chi tiết (`/catalog/:id`).
   - Thiết kế trang chi tiết sử dụng `Grid` chia làm 2 bên (hoặc 1 cột đứng trên Mobile):
     + Bên trái: Component `Paper` chứa hình ảnh sản phẩm phóng to rõ nét.
     + Bên phải: Các khối `Typography` chữ lớn thể hiện Thông số kỹ thuật chi tiết, Thương hiệu, Loại vỏ, Loại mâm tương thích, Định mức tồn kho (Min/Max).
     + Một bảng nhỏ sử dụng `Table` liệt kê chi tiết: Sản phẩm này hiện đang nằm ở những vị trí ô kệ nào trong kho và số lượng ở từng ô là bao nhiêu (Ví dụ: Ô K1-ZA-R02 có 5 cái, Ô K1-ZB-R01 có 2 cái).

Yêu cầu đầu ra: Viết mã nguồn hoàn chỉnh bằng TypeScript cho cấu trúc luồng duyệt sản phẩm 3 tầng này, đảm bảo liên kết Router (Next.js Link hoặc React Router) mượt mà và đồng bộ màu sắc Theme vàng/đen.