# 🚀 Hướng dẫn Deploy lên Vercel & Heroku

Dự án này là một ứng dụng fullstack với:
- **Frontend**: Next.js 14 trên Vercel
- **Backend**: NestJS + Prisma + PostgreSQL trên Heroku

## 📋 Yêu cầu

### Các tool cần cài đặt
- `heroku-cli`: https://devcenter.heroku.com/articles/heroku-cli
- `vercel-cli` (optional): https://vercel.com/docs/cli

### Accounts cần có
- Heroku account: https://www.heroku.com
- Vercel account: https://vercel.com
- GitHub account (để kết nối với git)

---

## 🔧 Bước 1: Chuẩn bị Database

### A. Tạo PostgreSQL Database trên Heroku
```bash
# Đăng nhập vào Heroku
heroku login

# Tạo app backend
heroku create vomamxenang-backend

# Thêm PostgreSQL addon
heroku addons:create heroku-postgresql:mini -a vomamxenang-backend

# Kiểm tra DATABASE_URL được tự động thiết lập
heroku config -a vomamxenang-backend
```

### B. Lấy DATABASE_URL
```bash
heroku config:get DATABASE_URL -a vomamxenang-backend
```
Copy giá trị này, bạn sẽ dùng cho backend.

---

## 🔐 Bước 2: Thiết lập Environment Variables

### A. Backend (Heroku)
```bash
heroku config:set \
  PORT=3001 \
  NODE_ENV=production \
  JWT_SECRET="$(openssl rand -hex 32)" \
  STRIPE_SECRET_KEY="sk_live_your_key_here" \
  STRIPE_WEBHOOK_SECRET="whsec_your_secret_here" \
  FRONTEND_URL="https://vomamxenang.vercel.app" \
  -a vomamxenang-backend
```

### B. Frontend (Vercel)
```bash
# Via CLI
vercel env add NEXT_PUBLIC_BACKEND_URL https://vomamxenang-backend.herokuapp.com/api/v1

# Hoặc manual:
# 1. Vào https://vercel.com/dashboard
# 2. Chọn project
# 3. Settings > Environment Variables
# 4. Thêm NEXT_PUBLIC_BACKEND_URL
```

---

## 📦 Bước 3: Deploy Backend lên Heroku

### A. Thêm remote Heroku
```bash
cd backend
heroku git:remote -a vomamxenang-backend
```

### B. Deploy
```bash
git push heroku main
# hoặc
git push heroku master
```

### C. Chạy database migrations
```bash
heroku run npm run prisma:migrate -a vomamxenang-backend
```

### D. (Optional) Seed database
```bash
heroku run npm run seed -a vomamxenang-backend
```

### E. Kiểm tra logs
```bash
heroku logs -a vomamxenang-backend -t
```

### F. Kiểm tra backend có chạy không
```bash
curl https://vomamxenang-backend.herokuapp.com/api/v1/health
```

---

## 🎨 Bước 4: Deploy Frontend lên Vercel

### Option 1: Deploy via GitHub (Recommended)
```bash
# 1. Push code lên GitHub
git add .
git commit -m "Deploy: prepare for production"
git push origin main

# 2. Vào https://vercel.com
# 3. Click "New Project"
# 4. Import từ GitHub repository
# 5. Configure:
#    - Framework: Next.js
#    - Root Directory: frontend
#    - Environment Variables:
#      - NEXT_PUBLIC_BACKEND_URL=https://vomamxenang-backend.herokuapp.com/api/v1
# 6. Click Deploy
```

### Option 2: Deploy via CLI
```bash
npm install -g vercel

cd frontend

# Lần đầu
vercel

# Lần sau
vercel --prod
```

---

## 🌍 Bước 5: Cấu hình Domain (Optional)

### A. Custom domain Heroku
```bash
heroku domains:add your-backend-domain.com -a vomamxenang-backend
```

### B. Custom domain Vercel
- Vào Vercel Dashboard > Settings > Domains
- Thêm domain
- Update DNS records theo hướng dẫn

---

## 🧪 Kiểm tra Deployment

### 1. Test Backend
```bash
# Health check
curl https://vomamxenang-backend.herokuapp.com/api/v1/health

# Test login
curl -X POST https://vomamxenang-backend.herokuapp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vomamxenang.local","password":"admin123"}'
```

### 2. Test Frontend
- Mở https://vomamxenang.vercel.app
- Thử đăng nhập
- Kiểm tra network requests trong DevTools

---

## 🔄 Cập nhật Code sau này

### Backend
```bash
cd backend

# Commit changes
git add .
git commit -m "feat: update backend"

# Push to Heroku
git push heroku main

# (Nếu có migration mới)
heroku run npm run prisma:migrate -a vomamxenang-backend
```

### Frontend
```bash
cd frontend

# Commit changes
git add .
git commit -m "feat: update frontend"

# Push to GitHub (tự động deploy qua Vercel)
git push origin main
```

---

## ⚠️ Troubleshooting

### Backend không deploy
```bash
# Kiểm tra logs
heroku logs -a vomamxenang-backend -t

# Rebuild
heroku builds:cancel -a vomamxenang-backend
git push heroku main --force
```

### Database migration lỗi
```bash
# Kiểm tra database connections
heroku pg:info -a vomamxenang-backend

# Connect to database trực tiếp
heroku pg:psql -a vomamxenang-backend
```

### Frontend không connect backend
```bash
# Kiểm tra environment variables
vercel env list

# Re-deploy
vercel --prod --force
```

### CORS error
```bash
# Cập nhật FRONTEND_URL trên Heroku
heroku config:set FRONTEND_URL="https://vomamxenang.vercel.app" -a vomamxenang-backend

# Restart app
heroku restart -a vomamxenang-backend
```

---

## 📝 Useful Commands

### Heroku
```bash
# View logs
heroku logs -a vomamxenang-backend -t

# Scale dynos
heroku ps:scale web=1 -a vomamxenang-backend

# List config vars
heroku config -a vomamxenang-backend

# Set config
heroku config:set KEY=value -a vomamxenang-backend

# Database access
heroku pg:psql -a vomamxenang-backend
```

### Vercel
```bash
# View deployments
vercel list

# View logs
vercel logs

# Check environment
vercel env list
```

---

## 🎯 Production Checklist

- [ ] DATABASE_URL setup trên Heroku
- [ ] JWT_SECRET is strong (bạn có thể dùng `openssl rand -hex 32`)
- [ ] FRONTEND_URL set đúng
- [ ] STRIPE keys configured (nếu dùng Stripe)
- [ ] Database migrations chạy thành công
- [ ] Backend logs không có error
- [ ] Frontend connect được backend
- [ ] Login test thành công
- [ ] CORS headers đúng
- [ ] Production database backup strategy

---

## 🔗 Useful Links

- Heroku Docs: https://devcenter.heroku.com/
- Vercel Docs: https://vercel.com/docs
- NestJS Deployment: https://docs.nestjs.com/deployment
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment

---

**Cần help?** Hãy check logs hoặc tạo issue.
