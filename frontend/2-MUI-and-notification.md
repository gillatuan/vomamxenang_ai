Nhiệm vụ: Thiết kế và viết code cho Màn hình Tổng quan (Dashboard) bằng MaterialUI tích hợp hệ thống Cảnh báo tồn kho thông minh vượt định mức Min/Max.

Yêu cầu giao diện & Chức năng:
1. CÁC THẺ CHỈ SỐ (KPI Cards): Sử dụng component `Grid` và `Card`, `CardContent`, `Typography` kết hợp với `Box` của MUI để tạo 4 thẻ chỉ số trên cùng (đầy đủ icon từ `@mui/icons-material`):
   - Tổng số lượng vỏ xe hiện tại.
   - Số lượng mâm xe hiện tại.
   - Số lượng mã hàng ĐANG DƯỚI ĐỊNH MỨC (Sắp hết hàng).
   - Số đơn Nhập/Xuất hoàn thành trong ngày.
2. TRUNG TÂM CẢNH BÁO TỒN KHO ĐỎ (Alert Center):
   - Sử dụng component `Alert` của MUI với thuộc tính `severity="error"` hoặc `severity="warning"`.
   - Hiển thị danh sách các mã vỏ xe có Số lượng tồn kho thực tế < `minStock`. Cạnh mỗi dòng alert, đặt một `Button` dạng `size="small"` với `variant="contained"` màu đỏ/cam để nhân viên bấm phát chuyển ngay sang trang Lập phiếu nhập hàng.
3. BIỂU ĐỒ THỐNG KÊ (Chỉ hiển thị cho ADMIN_MANAGER):
   - Kết hợp MUI với thư viện Recharts để vẽ biểu đồ cột xu hướng Nhập/Xuất và biểu đồ tròn cơ cấu thương hiệu (Bridgestone, Michelin, Casumina...). Đặt biểu đồ gọn gàng trong các khối `Paper` có `elevation={2}`.
4. PHÂN QUYỀN TRÊN DASHBOARD: Đối với role "STOREKEEPER", sử dụng điều kiện render để ẩn toàn bộ giá trị tiền tệ, chỉ hiển thị số lượng (Units).

Yêu cầu đầu ra: Mã nguồn hoàn chỉnh cho component Dashboard sử dụng triệt để hệ thống Grid và Card của MUI, responsive mượt mà trên di động.