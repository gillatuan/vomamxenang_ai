Act as a Next.js Expert. I need to fix the authentication middleware. 

Currently, the middleware is blocking public routes, but I want end-users to be able to freely access public pages (like the homepage, blogs, and the product catalog) WITHOUT requiring any authentication token. Only the internal CRM routes under `/dashboard` should require a valid session/token.

Please update or create the `middleware.ts` file in the root directory (or inside `src/`) to achieve this.
- Public routes to allow: `/`, `/products`, `/blog`, `/blog/[slug]`, `/cart`.
- Protected routes to block: `/dashboard`, `/dashboard/*`.
- Auth routes to allow (but redirect to dashboard if already logged in): `/login`, `/register`.

Use NextAuth.js (withAuth) or standard Next.js Middleware depending on our current auth setup. Ensure the `config.matcher` is optimized so it doesn't run on static assets (images, _next/static, favicon.ico).