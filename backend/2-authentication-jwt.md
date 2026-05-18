Now, let's implement the Auth Module in NestJS:
1. Install `@nestjs/jwt` and `bcrypt`.
2. Create an `AuthModule` with a `Register` and `Login` endpoint inside `AuthController`.
3. Passwords must be hashed using bcrypt before saving. Login should return a JWT access token.
4. Create a `JwtAuthGuard` to protect backend routes. Only users with valid tokens can access protected API endpoints.
5. Provide a seed script to create the initial Admin user.