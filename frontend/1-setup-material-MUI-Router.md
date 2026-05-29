Nhiệm vụ: Thiết kế Cấu trúc thư mục (Hỗ trợ PWA), cấu hình MaterialUI (MUI) Theme công nghiệp nặng, luồng Đăng nhập và Phân quyền cho hệ thống Vỏ mâm xe nâng.

Yêu cầu công nghệ: React/Next.js (App Router), MaterialUI (MUI), TypeScript.

Yêu cầu thực hiện:
1. CẤU HÌNH MUI THEME (`theme.ts`):
   - Thiết kế bảng màu phù hợp ngành xe nâng: `primary` dùng màu Vàng công nghiệp (như màu xe nâng CAT/Komatsu: #F57C00 hoặc #FFB300), `secondary` dùng màu Đen cao su/Xám kim loại (#263238), và nền `background.default` sạch sẽ (#F8F9FA).
   - Tối ưu `components` trong Theme: Các nút bấm (`MuiButton`) có độ bo góc nhỏ (4px - 6px) tạo cảm giác vuông vắn, cứng cáp của cơ khí. Các trường nhập liệu (`MuiTextField`) mặc định dạng `variant="outlined"`.
2. MOBILE-FIRST RESPONSIVE CỦA MUI: Giao diện phải sử dụng linh hoạt các breakpoint (`xs`, `sm`, `md`) của MUI. Sử dụng component `BottomNavigation` trên thiết bị di động để nhân viên kho dễ chạm bằng một ngón tay khi đang bốc xếp vỏ xe.
3. AUTHCONTEXT & ROUTER GUARD: Quản lý token, thông tin cơ bản và phân chia rõ rệt quyền truy cập:
   - "ADMIN_MANAGER": Toàn quyền hệ thống, xem giá tiền, chỉnh sửa PriceMatrix.
   - "STOREKEEPER": Chỉ hiển thị các tab Sơ đồ kho, Nhập/Xuất và Quét QR. Bị chặn hoàn toàn tại các route/component liên quan đến tiền tệ và tài chính bằng cơ chế ẩn hiển thị hoặc Guard.
4. MÀN HÌNH ĐĂNG NHẬP (`Login.tsx`): Sử dụng thẻ `Container`, `Box`, `Avatar` (với biểu tượng khóa hoặc xe nâng), và `TextField` của MUI để tạo một form đăng nhập chuẩn chỉ, có validate đầy đủ bằng TypeScript.

Yêu cầu đầu ra: Cung cấp file theme.ts, file AuthContext và mã nguồn trang Login hoàn chỉnh sử dụng đúng chuẩn các component của MaterialUI.