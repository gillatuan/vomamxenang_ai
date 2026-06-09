Nhiệm vụ: Thiết kế giao diện Form Nhập/Xuất hàng động, tích hợp module dịch vụ "Ép mâm xe nâng" đặc thù và tự động áp giá B2B theo nhóm Khách hàng bằng MaterialUI.

Yêu cầu giao diện & Chức năng:
1. FORM XUẤT HÀNG ĐỘNG (Dynamic Invoice Form): Sử dụng `Autocomplete` của MUI để chọn Khách hàng. Hệ thống tự khóa giá theo nhóm sỉ từ backend gửi về. Thiết kế bảng thêm dòng sản phẩm động (Nút thêm dòng, nút xóa dòng bằng `IconButton`).
2. GỢI Ý VỊ TRÍ LẤY HÀNG: Cột "Vị trí lấy hàng" sử dụng `Select` của MUI. Khi chọn một mã lốp, dropdown tự động hiển thị danh sách các ô kệ đang còn hàng kèm số lượng thực tế để nhân viên tích chọn đúng vị trí bốc lốp.
3. MODULE NGHIỆP VỤ ĐẶC THÙ "ÉP MÂM XE NÂNG": Bố trí một thanh gạt `FormControlLabel` kết hợp với `Switch` của MUI mang tên "Bật chế độ Ép mâm sẵn". Khi bật, giao diện mở rộng bắt buộc nhân viên chọn thêm: 1 Mã Vỏ xe + 1 Mã Mâm xe tương thích + Ô nhập `TextField` "Chi phí công ép mâm".
4. BÁO CÁO BIẾN ĐỘNG KHO (Inventory Log): Sử dụng `Table` và component `Chip` của MUI để gắn tag màu sắc phân loại dòng chảy hàng hóa (Ví dụ: Loại ÉP MÂM hiển thị Chip màu Vàng, loại XUẤT HÀNG hiển thị Chip màu Đỏ).