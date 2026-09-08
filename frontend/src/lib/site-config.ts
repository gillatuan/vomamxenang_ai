export function canonicalSiteUrl(configured = process.env.NEXT_PUBLIC_SITE_URL) {
  const url = new URL(configured || 'https://www.vomamxenang.com');
  // Vercel permanently redirects the apex domain to this public hostname.
  if (url.hostname === 'vomamxenang.com' || url.hostname === 'www.vomamxenang.com') {
    url.hostname = 'www.vomamxenang.com';
    url.protocol = 'https:';
  }
  return url.origin;
}

export const siteUrl = canonicalSiteUrl();
