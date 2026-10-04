# Architecture

Admin browser -> resize to WebP <=1600x1200 -> authenticated /admin/media/image -> @vercel\/blob -> Vercel OIDC -> public Blob URL -> Product.imageUrl or Post.seo.imageUrl.

Product SEO migration is a repository script with dry-run default and explicit --apply. It updates only weak/missing content/SEO fields and never changes prices, stock, SKU, product type or publication state.
