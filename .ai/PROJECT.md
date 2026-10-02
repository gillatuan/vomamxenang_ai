# Project Context
## Product
Forklift tire/rim commerce and operations system with warehouse/inventory, B2B pricing, orders, content/SEO and AI-assisted content generation.

## Frontend
Next.js 14 App Router, React 18, TypeScript, MUI, Zustand, Axios.

## Backend
NestJS 10, TypeScript, Prisma 5, PostgreSQL, JWT, Stripe, Pino; URI API versioning under `/api/v1`.

## Domain hotspots
Products/wheel rims; warehouse/location/stock/inventory transactions; suppliers/clients; orders/payments; B2B price matrix; posts/content/SEO; AI generation/daily content automation.

## Delivery
GitHub Actions verifies frontend/backend. Production currently targets Vercel for both apps. Do not assume AWS is active unless executable configuration proves it.

## Definition of done
Acceptance criteria satisfied; relevant tests pass; lint/typecheck/build pass where applicable; review findings resolved; migration/deployment risk documented; human approves merge/release.
