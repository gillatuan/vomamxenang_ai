Nhiệm vụ: Thiết kế giao diện Sơ đồ kho hành lang sâu trực quan và tính năng BẬT CAMERA ĐIỆN THOẠI QUÉT MÃ QR để tìm vị trí lốp xe nâng siêu nhanh bằng MaterialUI.

Yêu cầu giao diện & Chức năng:
1. SƠ ĐỒ KHO TRỰC QUAN (Visual Warehouse Map): Mô phỏng kho lốp dạng hành lang sâu theo các cột đứng bằng `Grid` và `Stack` của MUI. Sử dụng component `LinearProgress` (Màu `success` khi trống, màu `error` khi đầy) làm thanh hiển thị sức chứa an toàn của từng cột lốp.
2. TÍNH NĂNG "BẬT CAMERA QUÉT QR TÌM VỊ TRÍ": Bố trí một nút bấm tròn nổi bật (`Fab` - Floating Action Button) biểu tượng Camera. Khi bấm, mở một `Dialog` (Modal) toàn màn hình, bật camera quét mã QR trên lốp (thư viện `html5-qrcode`). Khi quét trúng, tự động đóng Dialog và "Highlight" (tạo viền nhấp nháy bằng `sx` prop của MUI) trực tiếp vào ô kệ chứa lốp đó trên sơ đồ.
3. DIALOG CHI TIẾT Ô KHO: Nhấp vào ô kệ hiển thị `Dialog` chứa `List` danh sách chi tiết các mặt hàng lốp/mâm kèm số lượng thực tế tại ô đó.