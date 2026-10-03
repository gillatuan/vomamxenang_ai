# Plan

1. Add idempotent dry-run/apply product SEO content migration.
2. Ground generated copy in existing catalog facts only; avoid unsupported load/performance claims.
3. Add ADMIN_MANAGER-only image upload endpoint backed by Vercel Blob with Vercel OIDC.
4. Resize/compress images in browser before upload; backend validates MIME/size.
5. Integrate Product imageUrl and Post seo.imageUrl editors.
6. Keep production migration manual and separately approved.
