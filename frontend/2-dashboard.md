Nhiệm vụ: Thiết kế và viết code cho Màn hình Tổng quan (Dashboard) bằng MaterialUI tích hợp hệ thống Cảnh báo tồn kho thông minh vượt định mức Min/Max.

Yêu cầu giao diện & Chức năng:
1. CÁC THẺ CHỈ SỐ (KPI Cards): Sử dụng `Grid`, `Card`, và `Typography` kết hợp với `@mui/icons-material` tạo 4 thẻ chỉ số: Tổng số lượng vỏ, tổng số lượng mâm, số mặt hàng dưới định mức (sắp hết), số đơn nhập/xuất trong ngày.
2. TRUNG TÂM CẢNH BÁO TỒN KHO ĐỎ (Alert Center): Sử dụng component `Alert` của MUI (`severity="error"`). Hiển thị danh sách các mã hàng chạm mức tối thiểu kèm nút hành động `Button` "Tạo đơn nhập nhanh".
3. BIỂU ĐỒ THỐNG KÊ (Quyền ADMIN_MANAGER): Kết hợp MUI với Recharts vẽ biểu đồ cột doanh thu nhập xuất và biểu đồ tròn tỷ lệ thương hiệu sản phẩm, đặt gọn gàng bên trong khối `Paper` có `elevation={2}`.