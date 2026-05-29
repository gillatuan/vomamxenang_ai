Nhiệm vụ: Thiết kế giao diện Form Nhập/Xuất hàng động, module dịch vụ "Ép mâm xe nâng" đặc thù và tự động áp giá B2B theo nhóm Khách hàng bằng MaterialUI.

Yêu cầu giao diện & Chức năng:
1. FORM XUẤT HÀNG ĐỘNG (Dynamic Invoice Form):
   - Sử dụng component `Autocomplete` của MUI để nhân viên tìm kiếm và chọn nhanh Khách hàng. Khi chọn xong một khách hàng thuộc nhóm Đại lý, hệ thống tự động khóa giá bán ở các dòng sản phẩm theo đúng bảng giá sỉ của họ.
   - Danh sách hàng hóa xuất/nhập được thiết kế dạng bảng động. Cho phép bấm nút `Button` "Thêm dòng" với icon `Add`. Ở mỗi dòng, có nút `IconButton` icon `Delete` màu đỏ để xóa dòng.
   - **Gợi ý vị trí bốc hàng:** Sử dụng component `Select` hoặc `Autocomplete` của MUI cho cột "Vị trí lấy hàng". Khi nhân viên chọn một mã lốp, dropdown này sẽ tự động hiển thị danh sách các ô kệ đang có hàng và số lượng tồn tương ứng (Ví dụ: "Kệ A1 - Còn 3 cái", "Kệ B2 - Còn 8 cái") để nhân viên tích chọn đúng vị trí thực tế họ sẽ ra lấy lốp.

2. MODULE NGHIỆP VỤ ĐẶC THÙ "ÉP MÂM XE NÂNG" (Pressing Logistics Combo):
   - Trên form nhập/xuất, bố trí một thanh gạt `FormControlLabel` kết hợp với `Switch` của MUI mang tên "Bật chế độ Ép mâm sẵn".
   - Khi bật `Switch` này lên, giao diện sẽ sử dụng hiệu ứng hiển thị mở rộng thêm các trường bắt buộc trên cùng một dòng hàng: Nhân viên phải chọn 1 Mã Vỏ xe + 1 Mã Mâm xe tương thích có sẵn trong kho + Nhập số tiền vào `TextField` "Chi phí công ép mâm".

3. MÀN HÌNH BÁO CÁO BIẾN ĐỘNG KHO (Inventory Log): Sử dụng `Table` của MUI có phân màu xen kẽ giữa các dòng (`striped rows`) để hiển thị lịch sử dòng chảy hàng hóa. Các loại giao dịch đặc thù như "ÉP MÂM" hoặc "RÃ BÁNH" sẽ được gắn các chip màu sắc khác nhau bằng component `Chip` của MUI (Ví dụ: Loại ÉP MÂM hiển thị `Chip` màu `primary` màu vàng, loại XUẤT HÀNG hiển thị `Chip` màu `error` màu đỏ) để nhân viên quản lý nhìn lướt qua là phân loại được ngay.

Yêu cầu đầu ra: Cung cấp mã nguồn hoàn chỉnh cho Form nghiệp vụ Nhập/Xuất/Ép mâm nâng cao bằng MaterialUI và TypeScript.