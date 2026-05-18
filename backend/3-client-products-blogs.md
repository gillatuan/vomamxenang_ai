Let's build the core REST API endpoints. Create 3 modules: `ClientModule`, `ProductModule`, and `PostModule`.
Each module must have a Controller and Service handling full CRUD operations using Prisma:
1. `GET /clients`, `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id` (Protected by JwtAuthGuard).
2. `GET /products` (Public for frontend shop), plus CRUD endpoints for products (Protected by JwtAuthGuard). Allow `sellingPrice` to be optional.
3. `GET /posts` (Public for blog), plus CRUD endpoints for posts (Protected by JwtAuthGuard).