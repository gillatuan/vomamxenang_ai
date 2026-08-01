Nhiệm vụ: Thiết kế Cấu trúc thư mục (Hỗ trợ PWA), cấu hình MaterialUI (MUI) Theme công nghiệp nặng, luồng Đăng nhập, Đăng ký, Quên mật khẩu và các liên kết điều hướng quay về trang chủ.

Yêu cầu kỹ thuật & Giao diện:
1. CẤU HÌNH MUI THEME (`theme.ts`): Cài đặt màu `primary` Vàng công nghiệp (#F57C00), `secondary` Đen lốp/Xám kim loại (#263238), và nền `background.default` (#F8F9FA). Tối ưu responsive trên di động.
2. LIÊN KẾT ĐIỀU HƯỚNG TRÊN FORM ĐĂNG NHẬP (`Login.tsx`):
   - Form Đăng nhập sử dụng các `TextField` dạng `variant="outlined"` gọn gàng.
   - **Bổ sung bắt buộc:** Ở góc trên hoặc dưới form phải có nút `Button` hoặc `Link` dạng "← Quay lại Trang Chủ" sử dụng router của Next.js/React-Router.
   - Phía dưới nút Đăng nhập phải bố trí 2 đường link đối xứng sử dụng `Grid` và `Link` của MUI: "Đăng ký tài khoản mới" và "Quên mật khẩu?".
3. MÀN HÌNH ĐĂNG KÝ (`Register.tsx`) & QUÊN MẬT KHẨU (`ForgotPassword.tsx`):
   - Tạo giao diện đồng bộ với trang Login. Trang Đăng ký có validate nhập lại mật khẩu. Trang Quên mật khẩu có ô nhập Email và nút "Gửi mã khôi phục". Tất cả đều phải có link quay ngược lại trang Đăng nhập.
4. AUTHCONTEXT & ROUTER GUARD: Quản lý token, phân quyền ADMIN_MANAGER (Toàn quyền tài chính) và STOREKEEPER (Quản lý kho vật lý, quét mã QR, ẩn giá tiền).

Yêu cầu đầu ra: Cung cấp file theme.ts, file AuthContext và mã nguồn 3 trang Login, Register, ForgotPassword hoàn chỉnh sử dụng đúng chuẩn các component của MaterialUI.