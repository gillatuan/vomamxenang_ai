# Demo product prices (staging only)

Purpose: temporarily populate `Product.sellingPrice` for already-published products with missing prices, so testers can exercise product listing, sort/filter, detail, cart and checkout. **These amounts are not sale prices or actual quotes.**

## Market references (VND per tire)

- [Xe Nâng Hiệp Phát – published solid and pneumatic tire prices (2026)](https://xenanghiepphat.com/lop-xe-nang)
- [Lốp Xe Nâng – published used tire price ranges](https://lopxenang.vn/lop-xe-nang-cu/)
- [XE NÂNG THACOES – 2026 solid tire price examples](https://thacoes.com/bang-gia-lop-dac-xe-nang)
- [Partsworld – 2026 forklift tire price ranges](https://partsworld.vn/lop-xe-nang/page/3/)

Rules are in `backend/scripts/demo-product-prices.ts`. Values are sample estimates, not exact SKU-by-SKU competitor quotes. Unknown types/sizes, non-marking tires and rims remain unpriced rather than inventing a value. Existing `sellingPrice` is **never overwritten**; `importPrice` and stock quantities are untouched.

## Run against a disposable database

1. Clone the required schema/data into a dedicated database with a name containing `_staging`, `_demo`, `_test`, or `_sandbox` (e.g. `vomamxenang_demo`). Never point this to production or a production database branch.
2. In `backend`, install dependencies and set `DATABASE_URL` for that database, with `APP_ENV=staging` and no production-mode `NODE_ENV`.
3. Review the dry-run JSON, which enumerates matched products, suggested prices and source URLs:
   ```sh
   yarn ts-node --transpile-only scripts/apply-demo-product-prices.ts
   ```
4. Explicitly apply after reviewing:
   ```sh
   ALLOW_DEMO_PRICE_WRITE=YES yarn ts-node --transpile-only scripts/apply-demo-product-prices.ts --apply
   ```
5. Point a separate frontend deployment to the test API, and set `NEXT_PUBLIC_DEMO_PRICING=true` to show warning banners on listing, detail, and checkout.
6. Use Stripe **test keys** and test credentials only. Never process actual transactions with example prices.

## Test plan

- Visit `/products`: verify prices on supported unpriced tire SKUs, sorting by price and filtering up to 15 million VND.
- Visit `/products/[id]`: verify sample price and Add to Cart.
- Add 2 units and confirm subtotal calculation in cart and checkout.
- Test quantity updates and removing an item.
- Complete a Stripe **test-mode** checkout; verify server-calculated totals and order status, not merely the client display.
- Verify products with real prices remain unchanged, and unsupported categories continue to display contact-for-quote.

After testing, discard the demo DB or restore it from a clean backup. Do not publish demo pricing to the live storefront. To set real prices use product management: replace individual `sellingPrice` values with verified business prices.
