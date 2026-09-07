# Đồng bộ database local và production

Schema và dữ liệu nội dung được phát hành theo hai cơ chế riêng:

- Prisma migrations là nguồn sự thật cho schema. Mỗi thay đổi schema phải có migration mới trong `prisma/migrations`.
- Seed versioned trong `prisma/seeds/production` là nguồn sự thật cho catalog, bài viết và dữ liệu nội dung dùng chung. Không sửa seed đã được phát hành; tạo seed số tiếp theo và thêm vào `registry.ts`.

## Local

Sau khi kéo thay đổi có database hoặc nội dung mới, chạy:

```bash
cd backend
yarn db:sync:local
```

Lệnh này áp migrations, tạo fixture local và chạy toàn bộ content release chưa có trong `SeedHistory`. Cần PostgreSQL local đang chạy và `backend/.env.local` có `DATABASE_URL` đúng.

## Production

Vercel chạy tự động `yarn prisma:migrate` và `APP_ENV=production yarn db:seed:production` trong `backend/vercel.json` mỗi lần deploy backend. `SeedHistory` bảo đảm mỗi release dữ liệu chỉ chạy một lần.

Không chạy `db:sync:production` trên máy cá nhân trừ khi đã được cấp quyền sử dụng database production. CI/CD là đường triển khai mặc định.
