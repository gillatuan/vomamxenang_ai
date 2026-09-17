# SEO V3.1 Batch 1 API

Base path: `/api/v1/admin/seo`.

All endpoints in this document require a valid Bearer JWT and role `ADMIN_MANAGER`. Missing/invalid JWT returns `401`; authenticated users without that role return `403`. Nest validation rejects invalid body/query/parameter data with `400`; missing resources return `404`; duplicate keyword or internal-link identity returns `409` where applicable.

## Readable SEO content

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/products` | Product SEO source fields. |
| `GET` | `/posts` | Post SEO source fields. |

These are read-only admin data sources; Product/Post remain managed by their existing CRUD APIs.

## Keywords

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/keywords?page=1&limit=25&status=ACTIVE` | Paginated clustered keywords. |
| `POST` | `/keywords` | Create a keyword. |
| `PATCH` | `/keywords/:id` | Update a keyword. |
| `DELETE` | `/keywords/:id` | Delete a keyword. |

`POST /keywords` example:

```json
{
  "keyword": "lốp đặc xe nâng",
  "type": "PRIMARY",
  "intent": "TRANSACTIONAL",
  "priority": 5,
  "cluster": "vỏ mâm xe nâng",
  "targetUrl": "https://www.vomamxenang.com/lop-dac-xe-nang",
  "productId": "optional-product-id",
  "status": "ACTIVE",
  "notes": "Chỉ là kế hoạch nội dung; không có search volume/ranking chưa được xác minh."
}
```

`keyword` is unique. `priority` is 1–5. A keyword may reference one Product or one Post, never both. `targetUrl` must be absolute HTTP(S). Responses include optional linked Product/Post summary.

## SEO audits

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/audits?page=1&limit=25` | Paginated audit history. |
| `POST` | `/audits` | Audit stored metadata/content of one Product or Post. |
| `GET` | `/audits/:id` | Read one audit including report and issues. |
| `POST` | `/audit` | Existing full public-HTML site audit. |

`POST /audits`:

```json
{ "sourceType": "PRODUCT", "sourceId": "product-id" }
```

The per-content endpoint records title, meta description, canonical path, primary keyword, product image alt, heading levels, stored internal links, issues and a deterministic checklist score. It does not claim search-engine rank, traffic or third-party metrics, and it does not crawl external sites.

## Internal links

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/internal-links` | Existing recommendation list. |
| `POST` | `/internal-links` | Create a reviewable suggestion. |
| `PATCH` | `/internal-links/:id` | Update anchor, reason or `PENDING`/`APPROVED`/`REJECTED` status. |

`POST /internal-links` requires existing Product/Post source and target IDs, absolute source/target URLs, anchor text, reason and score 0–100. It rejects a self-link and never edits published content automatically.

## Backlink opportunities

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/opportunities` | Existing opportunity records. |
| `GET` | `/opportunities/:id` | Existing opportunity detail. |
| `GET` | `/backlinks/opportunities` | Alias for opportunity listing. |
| `PATCH` | `/opportunities/:id` | Update existing review status/notes. |
| `PATCH` | `/backlinks/opportunities/:id` | Alias for update. |

Only the existing evidence-backed record fields are returned. Batch 1 does not create data for DA, DR, traffic, spam score, search volume, dofollow state or guest-post availability; such values remain unknown unless externally verified. Existing pre-Batch-1 research/outreach routes are not part of this implementation and are intentionally not exercised.

## Content campaigns

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/campaigns?page=1&limit=25` | Paginated campaigns and ordered Post joins. |
| `POST` | `/campaigns` | Create a campaign using existing Posts. |
| `GET` | `/campaigns/:id` | Read campaign detail. |
| `PATCH` | `/campaigns/:id` | Update campaign and optionally replace its ordered Post set. |

`POST /campaigns` example:

```json
{
  "name": "Chuyển kho 2026",
  "slug": "chuyen-kho-2026",
  "description": "Chuỗi nội dung phục vụ kế hoạch chuyển kho.",
  "goal": "Điều phối và tư vấn khách hàng.",
  "status": "DRAFT",
  "posts": [{ "postId": "existing-post-id", "sortOrder": 0, "plannedAt": "2026-10-01T00:00:00.000Z" }]
}
```

Each listed post ID must exist and can appear once in a campaign. Campaign creation/update does not publish, generate, edit or delete any Post.
When both dates are supplied, `endsAt` must be on or after `startsAt`.
