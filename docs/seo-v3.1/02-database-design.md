# Database Design — Batch 1

## Reused entities

| Entity | Decision | Reason |
| --- | --- | --- |
| `Product` | MODIFY relation only | Existing Product owns SEO metadata and public URL. |
| `Post` | MODIFY relation only | Existing Post owns blog content and publication status. |
| `SeoAudit` | MODIFY additively | Existing whole-site audit report remains valid. |
| `InternalLinkSuggestion` | REUSE | Already stores source/target URL, anchor, reason, score and review status. |
| `BacklinkOpportunity` / `Backlink` | REUSE | Already preserve evidence, target, review status and verification state. |
| `Media` | NOT NEEDED | No equivalent model exists; campaign posts reuse Post and Batch 1 has no media workflow. |

## New entities

### SeoKeyword

One site-wide canonical keyword record. It can be clustered and optionally linked to one Product or Post. `targetUrl` is retained even for topic/campaign keywords without a content relation.

- `keyword` is unique.
- `type`, `intent`, `priority`, `status` use enums or constrained values.
- `cluster` is nullable, indexed with status.
- Product and Post references are nullable and indexed; service validation prevents linking the same keyword to both.
- Search volume, ranking, traffic and third-party authority metrics are intentionally absent.

### ContentCampaign / CampaignPost

`ContentCampaign` groups existing Posts. `CampaignPost` is the ordered join table and may hold a planning note/date. It does not copy post title, content, SEO or media.

- Campaign `slug` is unique for stable administration/URLs.
- Campaign status reuses existing `ContentStatus`.
- `(campaignId, postId)` is unique and cascade deletion only removes the join row, never the Post.

## SeoAudit extension

Existing `report` remains required for backwards compatibility. Optional subject fields permit an audit record to describe `SITE`, `PRODUCT` or `POST`, including stored metadata checks, heading structure, internal-link snapshot, issues and score. Product/Post foreign keys use `onDelete: SetNull` to preserve an audit trail after content removal.

## Existing backlink data

The existing opportunity model has evidence URL, manual-review flag, suggested target/anchors, risk and last-check timestamp. Legacy score columns are not populated by Batch 1 and must be treated as `UNKNOWN` unless externally verified. No external research or outreach is implemented in this batch.

## Migration safety

The migration is additive: enums, nullable columns, tables, indexes and foreign keys only. Existing audit reports remain readable; existing Product/Post rows require no backfill. No production seed or destructive operation is included.
