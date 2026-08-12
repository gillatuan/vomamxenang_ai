# CI/CD Vercel

Workflow [vercel-production.yml](.github/workflows/vercel-production.yml) chạy khi mở pull request vào `main` hoặc push lên `main`.

- Pull request: kiểm tra TypeScript/build cho frontend và backend.
- Push vào `main`: chạy kiểm tra, áp dụng Prisma migration, deploy backend rồi deploy frontend lên Vercel Production.

## Thiết lập một lần trên GitHub

Vào **Repository Settings → Secrets and variables → Actions**.

Thêm các **Repository secrets** sau:

| Tên | Giá trị |
| --- | --- |
| `VERCEL_TOKEN` | Personal access token của Vercel có quyền deploy. |
| `VERCEL_ORG_ID` | Vercel team/org ID. |
| `VERCEL_FRONTEND_PROJECT_ID` | `prj_aSC5TXzFHOYOlXmkaKrMRVbISzmJ` |
| `VERCEL_BACKEND_PROJECT_ID` | `prj_leoAlnFpMZ9cLvmHauxXMHAuugWX` |

Thêm **Repository variable** (không phải secret):

| Tên | Giá trị |
| --- | --- |
| `NEXT_PUBLIC_API_BASE` | URL API production đầy đủ, bao gồm `/api/v1`. |

## Biến môi trường tại Vercel

Thiết lập trực tiếp trong từng Vercel project, scope **Production**. Không commit key vào Git.

Frontend:

```text
NEXT_PUBLIC_API_BASE
NEXT_PUBLIC_ENV=production
```

Backend:

```text
DATABASE_URL
SHADOW_DATABASE_URL (nếu Prisma cần)
JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
FRONTEND_URL (có thể phân tách nhiều URL bằng dấu phẩy)
NODE_ENV=production
```

Sau khi các secret/variables được thêm, chỉ cần commit và push lên `main`; GitHub Actions sẽ tự deploy production. Backend được phục vụ bởi Vercel serverless function `backend/api/index.ts` qua rewrite `/api/*`.
