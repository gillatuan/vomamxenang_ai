Nhiệm vụ: Thiết kế giao diện Sơ đồ kho hành lang sâu trực quan và tính năng BẬT CAMERA ĐIỆN THOẠI QUÉT MÃ QR để tìm vị trí lốp xe nâng siêu nhanh bằng MaterialUI.

Yêu cầu giao diện & Chức năng:
1. SƠ ĐỒ KHO TRỰC QUAN (Visual Warehouse Map): 
   - Kho vỏ xe nâng có đặc thù là dạng hành lang sâu, lốp xếp thành từng cột đứng. Hãy sử dụng hệ thống `Grid` hoặc `Stack` của MUI để mô phỏng các ô Cột/Kệ (Slot).
   - Sử dụng component `LinearProgress` của MUI với các màu sắc linh hoạt (thông qua thuộc tính `color`: màu `success` khi kho trống, màu `error` khi ô kệ đã xếp đầy 100% chiều cao an toàn) để làm thanh hiển thị sức chứa của từng ô.
2. TÍNH NĂNG "BẬT CAMERA QUÉT QR TÌM VỊ TRÍ":
   - Trên giao diện mobile, bố trí một nút bấm tròn nổi bật (`Fab` - Floating Action Button) chứa biểu tượng Camera ở góc phải màn hình.
   - Khi bấm vào nút này, hệ thống sẽ mở một component `Dialog` (Modal) chiếm toàn màn hình mobile, kích hoạt Camera điện thoại (sử dụng thư viện quét mã như `html5-qrcode`).
   - Nhân viên quét mã QR dán trên hông chiếc vỏ xe nâng -> Hệ thống tự động đóng `Dialog` và thực hiện "Highlight" (tô viền màu vàng/cam nổi bật kèm hiệu ứng nhấp nháy bằng `sx` prop của MUI) chính xác vào ô cột/kệ trên sơ đồ đang chứa loại vỏ đó.
3. MODAL CHI TIẾT Ô KHO: Sử dụng `Dialog`, `DialogTitle`, `DialogContent` và `List`, `ListItem` của MUI để hiển thị chi tiết danh sách tất cả loại lốp, mâm đang nằm tại ô đó khi click vào.

Yêu cầu đầu ra: Viết mã nguồn hoàn chỉnh cho component Sơ đồ kho tích hợp Dialog quét mã QR bằng MaterialUI.