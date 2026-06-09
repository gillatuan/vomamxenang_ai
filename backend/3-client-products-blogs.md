Nhiệm vụ: Xây dựng các module cốt lõi cho REST API gồm `ClientModule`, `ProductModule`, `WheelRimModule` và `PostModule` xử lý CRUD nâng cao, hỗ trợ tương tác tương tác người dùng (Comment, Favourite) và lọc phân tầng Condition.

YÊU CẦU THỰC HIỆN:
Mỗi module cần có đầy đủ Controller và Service, sử dụng Prisma để tương tác với DB:
1. `ClientModule`: Quản lý khách hàng, tự động gán nhóm đối tác (`RETAIL`, `WHOLESALE_L1`, `WHOLESALE_L2`).
2. `ProductModule` & `WheelRimModule`:
   - `GET /products` và `GET /wheel-rims`: Cho phép lọc theo query parameter `condition` (`NEW` hoặc `USED`) để frontend hiển thị danh mục phân tầng.
   - `GET /products/:id` và `GET /wheel-rims/:id`: Lấy chi tiết thông tin kèm danh sách bình luận (`ProductComment`) và số lượt yêu thích.
   - `POST /products/:id/comment` và `POST /products/:id/favourite`: API xử lý tương tác của end-user (Yêu cầu đăng nhập).
3. `PostModule` (Quản lý Blog):
   - `GET /posts`: Public danh sách bài viết blog SEO/Vlogging.
   - `GET /posts/:slug` hoặc `:id`: Lấy chi tiết bài viết kèm danh sách bình luận (`PostComment`).
   - `POST /posts/:id/comment`: Cho phép người dùng để lại bình luận dưới bài viết (Có dữ liệu comment mặc định nếu chưa có người dùng tương tác).