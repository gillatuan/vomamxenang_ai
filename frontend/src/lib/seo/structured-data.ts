import { siteUrl } from '../site-config';
export type Crumb = { name: string; path: string };
export function breadcrumbSchema(items: Crumb[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: siteUrl + item.path })) };
}
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
export function siteSchema() {
  return [ { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Võ Mâm Xe Nâng', url: siteUrl }, { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Võ Mâm Xe Nâng', url: siteUrl, inLanguage: 'vi-VN', publisher: { '@id': `${siteUrl}/#organization` } } ];
}
