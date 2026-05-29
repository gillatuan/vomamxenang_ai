Nhiệm vụ: Xây dựng màn hình Quản lý danh mục (Vỏ xe & Mâm xe), cấu hình Định mức tồn kho (Min/Max) và tự động xuất Tem in QR bằng MaterialUI.

Yêu cầu giao diện & Chức năng:
1. BẢNG DANH SÁCH DANH MỤC: 
   - Sử dụng component `Tabs` và `Tab` của MUI để phân chia 2 khu vực độc lập: "Danh mục Vỏ xe" và "Danh mục Mâm xe" (Mâm cần hiển thị thêm số lỗ bu-lông, xe tương thích).
   - Danh sách hiển thị dưới dạng bảng dữ liệu nâng cao sử dụng `Table`, `TableHead`, `TableRow`, `TableCell`, `TableBody` của MUI (hoặc `DataGrid` nếu có sẵn), hỗ trợ phân trang (`TablePagination`) và tích hợp các `TextField` dạng `size="small"` ở trên đầu để lọc nhanh Thương hiệu, Kích thước.
2. FORM THÊM MỚI SẢN PHẨM: Đặt trong một `Dialog` lớn, sử dụng `Stack` hoặc `Grid` để sắp xếp các `TextField`, `Select` và `MenuItem` của MUI. Có đầy đủ trường nhập liệu thông số và 2 trường `minStock`, `maxStock`.
3. DIALOG TỰ ĐỘNG XUẤT TEM IN QR (Auto QR Label):
   - Khi bấm "Lưu", hệ thống đóng form và tự động mở một `Dialog` nhỏ hơn hiển thị bản xem trước (Preview) của con tem nhiệt (khổ 50x30mm).
   - Thiết kế con tem bằng các component `Typography` chữ đậm và hình ảnh QR sinh ra từ thư viện `qrcode.react`.
   - Tích hợp một nút `Button` với `variant="contained"` mang icon in ấn. Khi nhấn nút này, sử dụng CSS `@media print` của MUI để ra lệnh in cho trình duyệt, tự động ẩn toàn bộ các thành phần giao diện khác ngoại trừ khung con tem nhiệt để đẩy ra máy in tem (Xprinter).

Yêu cầu đầu ra: Viết mã nguồn cho màn hình quản lý danh mục và logic in ấn tem QR đồng bộ bằng MaterialUI.