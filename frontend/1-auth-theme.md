Nhiệm vụ: Thiết kế Cấu trúc thư mục (Hỗ trợ PWA), cấu hình MaterialUI (MUI) Theme công nghiệp nặng, luồng Đăng nhập và Phân quyền cho hệ thống Vỏ mâm xe nâng.

Yêu cầu kỹ thuật:
1. CẤU HÌNH MUI THEME (`theme.ts`):
   - Bảng màu đặc thù cơ giới: `primary` dùng màu Vàng công nghiệp (#F57C00 hoặc #FFB300), `secondary` dùng màu Đen cao su/Xám kim loại (#263238), nền `background.default` dùng màu xám nhạt (#F8F9FA).
2. MOBILE-FIRST RESPONSIVE: Sử dụng hệ thống Grid và BottomNavigation cho di động để nhân viên thao tác một tay dễ dàng tại kho hẹp.
3. AUTHCONTEXT & ROUTER GUARD: Quản lý đăng nhập và phân quyền truy cập:
   - "ADMIN_MANAGER": Toàn quyền, hiển thị thông tin tài chính và sửa đổi bảng giá sỉ.
   - "STOREKEEPER": Chỉ hiển thị các tính năng Sơ đồ kho, Nhập/Xuất, và Quét QR. Ẩn toàn bộ giá tiền.
4. MÀN HÌNH ĐĂNG NHẬP (`Login.tsx`): Sử dụng thẻ `Container`, `Card`, `Box`, và các `TextField` dạng `variant="outlined"` của MUI để thiết kế một form đăng nhập chuẩn chỉ, có lưu trạng thái "Ghi nhớ mật khẩu".