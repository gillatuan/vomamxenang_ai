# Admin SEO UI — Batch 2

The existing App Router catch-all page at `/admin/seo/[[...section]]` now has SEO navigation for Overview, Products, Posts, Keywords, Internal Links, Backlinks and Campaigns. The existing admin layout, sidebar, MUI, Axios client, JWT handling and backend RBAC are reused.

## Screens

- Overview shows counts of Products/Posts needing attention, keywords, internal-link suggestions, backlink opportunities and campaigns. “Needs attention” is a transparent checklist: missing primary keyword, meta title, meta description, canonical path and (for Products) image alt. It is not a Google score.
- Product and Post screens support search, metadata editing, a stored content audit and a public-view link. They only update `slug` and the existing `seo` JSON through existing Product/Post APIs.
- Keywords supports paginated/filterable list, creation, edit, delete, cluster, intent, priority, status, target URL and optional Product/Post assignment.
- Internal Links supports review, reject and editing the anchor/reason. It never inserts a link into published content.
- Backlinks is deliberately read-only in Batch 2: no research, crawl or outreach control is exposed.
- Campaigns supports create/edit and ordered selection of existing Posts. Loading, error and empty states are shown on each route.

All endpoints continue to require the existing `ADMIN_MANAGER` JWT role. A `STOREKEEPER` cannot access the backend SEO APIs even if they navigate directly.
