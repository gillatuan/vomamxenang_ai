Nhiệm vụ: Thiết kế trọn vẹn Luồng Giao diện Duyệt danh mục phân tầng: Tầng 1 (Lọc Vỏ Mới, Vỏ Cũ, Mâm Mới, Mâm Cũ) -> Tầng 2 (Danh sách hàng hóa kèm nhãn Condition công khai) -> Tầng 3 (Trang chi tiết tích hợp Comment, Favourite, Tồn kho thực tế) bằng MaterialUI.

Yêu cầu giao diện & Luồng trải nghiệm (UX):

1. TẦNG 1: TRANG LỰA CHỌN TRẠNG THÁI VÀ CHỦ CHỦ (Condition Gateway):
   - Giao diện trang chủ cửa hàng chia làm 4 Grid Card lớn rất trực quan đại diện cho 4 nhóm kinh doanh: "VỎ XE NÂNG MỚI 100%", "VỎ XE NÂNG ĐÃ QUA SỬ DỤNG (CŨ/LƯỚT)", "MÂM XE NÂNG MỚI", "MÂM XE NÂNG CŨ". 
   - Mỗi Card có hình ảnh minh họa tương ứng, khi click vào sẽ chuyển hướng sang Tầng 2 và tự động truyền Query Parameter tương ứng (Ví dụ: `?type=TIRE&condition=NEW`).

2. TẦNG 2: DANH SÁCH SẢN PHẨM PHÂN LOẠI (Catalog View):
   - Hiển thị danh sách sản phẩm. Trên mỗi Product Card hoặc hàng trong Table, **bắt buộc phải hiển thị một nhãn (Chip của MUI) thể hiện rõ "Condition"**: Màu xanh lá (`success`) cho hàng "MỚI 100%" và màu xám/cam (`warning`) cho hàng "CŨ/LƯỚT".
   - Mỗi sản phẩm có hình ảnh, thông số size, thương hiệu và tồn kho. Khi click vào Card sẽ điều hướng thẳng đến trang Chi tiết (`/catalog/:id`).

3. TẦNG 3: TRANG CHI TIẾT SẢN PHẨM & TƯƠNG TÁC NGƯỜI DÙNG (Product Detail & Interactions):
   - **Thông tin chi tiết:** Hiển thị hình ảnh lớn, thông số kỹ thuật, nhãn trạng thái cũ/mới, và một bảng `Table` nhỏ liệt kê lốp/mâm này hiện đang nằm ở chính xác những vị trí ô kệ nào trong kho (Vận hành nội bộ).
   - **Tương tác End-User (Comment & Favourite):**
     + Cạnh nút "Thêm vào giỏ hàng" phải có một nút hình Trái tim (`IconButton` icon `FavoriteBorder` hoặc `Favorite` màu đỏ nếu đã thích) để người dùng lưu vào danh sách yêu thích.
     + Phía dưới trang là Khu vực Bình luận (`Box` chứa bình luận). Sử dụng `Rating` component của MUI để đánh giá số sao (1-5 sao), một `TextField` nhập nội dung và nút "Gửi bình luận". Hiển thị danh sách các bình luận cũ kèm avatar người dùng trực quan.

Yêu cầu đầu ra: Viết mã nguồn hoàn chỉnh bằng TypeScript cho cấu trúc luồng duyệt sản phẩm 3 tầng này kèm tính năng Comment, Favourite bằng MaterialUI.