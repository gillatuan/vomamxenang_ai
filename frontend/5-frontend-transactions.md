Nhiệm vụ: Thiết kế giao diện Giỏ hàng có link xem lại sản phẩm, luồng Thanh toán từng bước (Next Step Verified), Form Nhập/Xuất động, Nghiệp vụ Ép mâm và danh sách Blog hiển thị bài viết chi tiết.

Yêu cầu giao diện & Chức năng:

1. GIỎ HÀNG NÂNG CAO (Cart Component) & LUỒNG THANH TOÁN (Next Step Validation):
   - **Link xem lại sản phẩm:** Trong bảng danh sách giỏ hàng, tên của mỗi sản phẩm phải được bọc trong component `Link` của MUI/Next.js trỏ thẳng về trang chi tiết sản phẩm (`/catalog/:id`) để người dùng click xem lại thông số bất cứ lúc nào.
   - **Luồng Thanh toán (MUI Stepper):** Khi bấm "Thanh toán", hệ thống chuyển sang trang Checkout sử dụng component `Stepper` và `Step`, `StepLabel` của MUI để thể hiện rõ 3 bước: Bước 1: Xem lại giỏ hàng -> Bước 2: Nhập thông tin giao hàng & Áp giá khách hàng (B2B PriceMatrix) -> Bước 3: Thanh toán qua cổng Stripe. Phải viết đủ layout cho cả 3 bước này để user xác thực và chuyển tiếp qua lại (Next/Back) mượt mà.

2. TRANG BLOG & TRANG CHI TIẾT BÀI VIẾT (Blog Layout & Detail Page):
   - **Hiển thị danh sách Post:** Tạo giao diện `/blog` sử dụng `Grid` hiển thị các bài viết dạng Card. Mỗi Card có `CardMedia` (Hình ảnh bài viết), `CardContent` (Tiêu đề, tóm tắt nội dung), và nút "Đọc thêm" dẫn vào trang chi tiết.
   - **Trang chi tiết bài viết (`/blog/:id`):** Hiển thị tiêu đề lớn, ngày đăng, video nhúng từ YouTube (nếu có bằng thẻ iframe/CardMedia), và toàn bộ nội dung bài viết. Phía dưới cùng hiển thị khu vực bình luận bài viết (`PostComment`) có sẵn các comment mặc định chân thực để tăng tương tác.

3. FORM KHO CHUYÊN DỤNG (Nhập/Xuất kho & Ép mâm Combo - Vận hành nội bộ):
   - Form Nhập/Xuất có tính năng thêm dòng động. Cột "Vị trí lấy hàng" hiển thị dropdown các ô kệ đang còn hàng.
   - Tích hợp công tắc gạt `Switch` "Combo Ép mâm sẵn". Khi bật, mở rộng form bắt chọn: 1 Vỏ + 1 Mâm tương thích + Ô nhập `TextField` phí công ép mâm để tự động trừ kho đồng thời cả vỏ và mâm khi hoàn tất.
   - Nhật ký dòng chảy kho (`Inventory Log`) sử dụng component `Chip` phân màu để đánh dấu giao dịch: Màu vàng cho ÉP MÂM, màu đỏ cho XUẤT HÀNG.

Yêu cầu đầu ra: Cung cấp mã nguồn Frontend hoàn chỉnh cho Giỏ hàng Stepper, Module Blog (Danh sách + Chi tiết + Comment mặc định) và Form Nhập/Xuất/Ép mâm nâng cao bằng MaterialUI.