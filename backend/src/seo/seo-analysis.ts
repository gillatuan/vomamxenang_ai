import { load } from 'cheerio';
import { PublicPage } from './public-fetch';
export const SITE = 'https://www.vomamxenang.com';
export type Content = { id: string; kind: 'PRODUCT' | 'POST'; title: string; path: string; content: string; seo: Record<string, unknown>; tags: string[]; size?: string | null; brand?: string | null; tireType?: string | null };
export type Issue = { code: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; detail: string };
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
export function pagePath(href: string, base = SITE) { try { const u = new URL(href, base); if (!['vomamxenang.com', 'www.vomamxenang.com'].includes(u.hostname)) return null; return u.pathname.replace(/\/$/, '') || '/'; } catch { return null; } }
export function links(html: string, base: string) { const $ = load(html); return $('a[href]').toArray().map(a => ({ href: new URL($(a).attr('href') || '', base).href, anchor: $(a).text().trim(), rel: $(a).attr('rel') || '' })); }
export function analyzePage(path: string, page: PublicPage, content?: Content) {
  const $ = load(page.html); const issues: Issue[] = [];
  const add = (code: string, severity: Issue['severity'], detail: string) => issues.push({ code, severity, detail });
  const title = $('title').first().text().trim(); const meta = $('meta[name="description"]').attr('content')?.trim() || '';
  if (page.status !== 200) add('HTTP_ERROR', 'Critical', `HTTP ${page.status}`);
  if (!title) add('MISSING_TITLE', 'High', 'Thiếu title');
  if (!meta) add('MISSING_META', 'High', 'Thiếu meta description');
  if (title.length > 70) add('LONG_TITLE', 'Low', `${title.length} ký tự; cân nhắc rút gọn`);
  const h1 = $('h1').length; if (h1 !== 1) add(h1 ? 'MULTIPLE_H1' : 'MISSING_H1', 'High', `${h1} H1 trong HTML trả về`);
  let previous = 1; $('h1,h2,h3,h4,h5,h6').each((_, el) => { const level = Number(el.tagName[1]); if (level > previous + 1) add('HEADING_HIERARCHY', 'Low', `H${previous} → H${level}`); previous = level; });
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  if (canonical.replace(/\/$/, '') !== `${SITE}${path === '/' ? '' : path}`) add('CANONICAL_PROBLEM', 'High', canonical || 'Thiếu canonical');
  if (/noindex/i.test(($('meta[name="robots"]').attr('content') || '') + String(page.headers['x-robots-tag'] || ''))) add('NOINDEX', 'High', 'Trang public có noindex');
  const schemas: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => { try { const walk = (v: unknown) => { if (!v || typeof v !== 'object') return; if (Array.isArray(v)) { v.forEach(walk); return; } const o = v as Record<string, unknown>; if (typeof o['@type'] === 'string') schemas.push(o['@type']); if (o['@graph']) walk(o['@graph']); }; walk(JSON.parse($(el).text())); } catch { add('INVALID_JSONLD', 'High', 'JSON-LD không parse được'); } });
  if (content && !schemas.includes(content.kind === 'PRODUCT' ? 'Product' : 'BlogPosting') && !(content.kind === 'POST' && schemas.includes('Article'))) add('MISSING_STRUCTURED_DATA', 'High', 'Thiếu schema nội dung');
  if (content && !schemas.includes('BreadcrumbList')) add('MISSING_BREADCRUMB_SCHEMA', 'Medium', 'Thiếu BreadcrumbList');
  const missingAlt = $('img').toArray().filter(el => !$(el).attr('alt')?.trim()).length;
  if (missingAlt) add('MISSING_IMAGE_ALT', 'Medium', `${missingAlt} ảnh thiếu alt`);
  if (content && !$('img').length) add('MISSING_IMAGE', 'Low', 'Chưa có ảnh trong HTML');
  if (content && !content.seo.primaryKeyword) add('MISSING_PRIMARY_KEYWORD', 'Medium', 'Chưa chọn từ khóa chính; xem keyword map');
  const body = load(content?.content || page.html); body('script,style,nav,header,footer').remove();
  const wordCount = body.root().text().trim().split(/\s+/).filter(Boolean).length;
  if (content && wordCount < 150) add('THIN_CONTENT', 'Medium', `${wordCount} từ; ngưỡng sàng lọc, cần đánh giá thủ công`);
  const outgoing = [...new Set($('a[href]').toArray().map(el => pagePath($(el).attr('href') || '', page.url)).filter((v): v is string => !!v && v !== path))];
  const contextual = content ? [...new Set(load(content.content)('a[href]').toArray().map(el => pagePath(el.attribs.href)).filter((v): v is string => !!v && v !== path))] : [];
  if (content && !contextual.length) add('NO_INTERNAL_LINKS', 'Medium', 'Mô tả chưa có liên kết nội bộ');
  if (content?.kind === 'POST' && !contextual.some(p => p.startsWith('/products/'))) add('NO_PRODUCT_LINKS', 'Medium', 'Bài viết chưa dẫn tới sản phẩm trong nội dung');
  return { path, url: SITE + (path === '/' ? '' : path), id: content?.id, kind: content?.kind || 'PAGE', title, meta, canonical, h1, wordCount, schemas, outgoing, contextual, issues, score: 100, incoming: [] as string[], contextualIncoming: [] as string[] };
}
export function recommendations(items: Content[]) {
  return items.flatMap(source => items.filter(target => target.id !== source.id || target.kind !== source.kind).map(target => {
    const reason: string[] = []; let score = 0;
    if (source.kind === 'PRODUCT' && target.kind === 'PRODUCT') {
      if (source.size && source.size === target.size) { score += 35; reason.push(`Cùng size ${source.size}`); }
      if (source.brand && source.brand === target.brand) { score += 35; reason.push(`Cùng thương hiệu ${source.brand}`); }
      if (source.tireType && source.tireType === target.tireType) { score += 15; reason.push(`Cùng loại lốp ${source.tireType}`); }
    }
    const shared = source.tags.filter(tag => target.tags.some(t => normalize(t) === normalize(tag)) && normalize(tag) !== 'lop xe nang');
    if (shared.length) { score += Math.min(shared.length * 8, 24); reason.push(`Cùng chủ đề: ${shared.slice(0, 3).join(', ')}`); }
    const sourceText = normalize(source.title + ' ' + load(source.content).text());
    const keywords = [target.size, target.brand, target.seo.primaryKeyword, ...target.tags].filter((v): v is string => typeof v === 'string' && v.length >= 4);
    const mentioned = keywords.filter(k => sourceText.includes(normalize(k)));
    if (mentioned.length) { score += Math.min(mentioned.length * 6, 24); reason.push(`Nội dung đề cập: ${mentioned.slice(0, 3).join(', ')}`); }
    if (source.kind === 'POST' && target.kind === 'PRODUCT' && score) score += 10;
    const existing = load(source.content)('a[href]').toArray().some(a => pagePath(a.attribs.href) === target.path);
    return { sourceType: source.kind, sourceId: source.id, targetType: target.kind, targetId: target.id, sourceUrl: SITE + source.path, targetUrl: SITE + target.path, anchorText: target.title, reason: reason.join('; '), score: Math.min(score, 100), existing };
  }).filter(x => x.score >= 25 && !x.existing).sort((a, b) => b.score - a.score || a.targetUrl.localeCompare(b.targetUrl)).slice(0, 5));
}
export function keywordMap(items: Content[]) {
  const products = items.filter(i => i.kind === 'PRODUCT'); const rows: Array<{ keyword: string; intent: string; primaryUrl: string; supportingUrls: string[]; competingPrimaryUrls: string[] }> = [];
  const add = (keyword: string, intent: string, primary: string, related: Content[]) => rows.push({ keyword, intent, primaryUrl: SITE + primary, supportingUrls: related.filter(i => i.path !== primary).map(i => SITE + i.path), competingPrimaryUrls: items.filter(i => normalize(String(i.seo.primaryKeyword || '')) === normalize(keyword) && i.path !== primary).map(i => SITE + i.path) });
  add('lốp xe nâng', 'COMMERCIAL', '/products', items);
  for (const size of [...new Set(products.map(i => i.size).filter(Boolean))]) {
    const related = products.filter(i => i.size === size).sort((a, b) => Number(!!a.brand) - Number(!!b.brand) || a.title.localeCompare(b.title));
    add(`lốp xe nâng ${size}`, 'SIZE', related[0].path, related);
  }
  for (const brand of [...new Set(products.map(i => i.brand).filter(Boolean))]) { const related = products.filter(i => i.brand === brand); add(`lốp xe nâng ${brand}`, 'BRAND', related[0].path, related); }
  for (const item of items) add(String(item.seo.primaryKeyword || item.title), item.kind === 'POST' ? 'INFORMATIONAL' : 'COMMERCIAL', item.path, items.filter(i => i.tags.some(t => item.tags.includes(t))));
  return rows.filter((row, index) => rows.findIndex(r => normalize(r.keyword) === normalize(row.keyword)) === index);
}

export class InternalLinkRecommendationService {
  recommend(items: Content[]) { return recommendations(items.filter(item => !String(item.seo.robots || '').includes('noindex'))); }
}
