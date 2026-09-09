import { richTextHtml, richTextPlain } from './rich-text';
import type { SeoMetadata } from './api-client';

export function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/, '');
}
export type RelatedContent = { id: string; slug?: string; aliases?: string[]; name?: string; title?: string; size?: string; brand?: string; tireType?: string; tags?: string[]; seo?: SeoMetadata; kind: 'products' | 'blog' };
export const contentPath = (item: { id: string; slug?: string | null }, kind: 'products' | 'blog') => `/${kind}/${encodeURIComponent(item.slug || item.id)}`;
export function contentKeywords(item: { name?: string; title?: string; tags?: string[]; seo?: SeoMetadata }) {
  return [...new Set([...(item.seo?.keywords || []), item.seo?.primaryKeyword || '', ...(item.seo?.secondaryKeywords || []), item.name || item.title || '', ...(item.tags || [])].map(x => x.trim()).filter(Boolean))].slice(0, 12);
}
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Link only existing phrases, once per destination, without changing wording or existing links.
export function linkRelatedContent(value: string, candidates: RelatedContent[], current: { id: string; kind: string }) {
  let html = richTextHtml(value);
  // Refresh links inserted before a title/alias change, while preserving anchors/query strings.
  html = html.replace(/href="([^"#?]+)([^"]*)"/g, (attribute, path: string, tail: string) => {
    const destination = candidates.find(item => item.slug && [item.id, item.slug, ...(item.aliases || [])].some(alias => path === `/${item.kind}/${encodeURIComponent(alias)}`));
    return destination ? `href="${contentPath(destination, destination.kind)}${tail}"` : attribute;
  });
  const text = richTextPlain(value).toLocaleLowerCase('vi');
  const self = candidates.find(item => item.id === current.id && item.kind === current.kind);
  const ownKeywords = new Set(self ? contentKeywords(self).map(word => word.toLocaleLowerCase('vi')) : []);
  const relevant = candidates.filter(item => item.slug && !(item.id === current.id && item.kind === current.kind))
    .flatMap(item => contentKeywords(item).filter(word => word.length >= 4 && !ownKeywords.has(word.toLocaleLowerCase('vi')) && text.includes(word.toLocaleLowerCase('vi'))).map(word => ({ item, word })))
    .sort((a, b) => b.word.length - a.word.length);
  const used = new Set<string>(candidates.filter(item => html.includes(`href="${contentPath(item, item.kind)}"`)).map(item => `${item.kind}:${item.id}`));
  // Sanitized tags may contain > inside quoted attributes; keep each tag intact.
  const pieces = html.split(/(<(?:[^>"']|"[^"]*"|'[^']*')*>)/g);
  let skip = 0;
  let count = used.size;
  return pieces.map(piece => {
    if (piece.startsWith('<')) {
      if (/^<(a|pre|code|h[1-6])(?:\s|>)/i.test(piece)) skip++;
      if (/^<\/(a|pre|code|h[1-6])\s*>/i.test(piece)) skip = Math.max(0, skip - 1);
      if (/^<a\s/i.test(piece)) {
        for (const entry of relevant) if (piece.includes(`href="${contentPath(entry.item, entry.item.kind)}"`)) used.add(`${entry.item.kind}:${entry.item.id}`);
      }
      return piece;
    }
    if (skip || count >= 5) return piece;
    // Work on text fragments separately so links inserted here cannot be nested.
    let fragments = [{ value: piece, linked: false }];
    for (const { item, word } of relevant) {
      const key = `${item.kind}:${item.id}`;
      if (used.has(key) || count >= 5) continue;
      const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegex(escapeHtml(word))})(?=$|[^\\p{L}\\p{N}])`, 'iu');
      fragments = fragments.flatMap(fragment => {
        if (fragment.linked || used.has(key)) return [fragment];
        const match = pattern.exec(fragment.value);
        if (!match) return [fragment];
        used.add(key); count++;
        const start = match.index + match[1].length;
        return [{ value: fragment.value.slice(0, start), linked: false }, { value: `<a href="${contentPath(item, item.kind)}">${match[2]}</a>`, linked: true }, { value: fragment.value.slice(start + match[2].length), linked: false }];
      });
    }
    return fragments.map(fragment => fragment.value).join('');
  }).join('');
}

// Related navigation is computed from actual attributes; descriptions remain editor-controlled.
export function relatedContent(current: RelatedContent, catalog: RelatedContent[]) {
  const ranked = catalog.filter(item => item.id !== current.id || item.kind !== current.kind).map(item => {
    let score = 0;
    if (current.size && current.size === item.size) score += 35;
    if (current.brand && current.brand === item.brand) score += 35;
    if (current.tireType && current.tireType === item.tireType) score += 15;
    const shared = (current.tags || []).filter(tag => (item.tags || []).includes(tag) && tag.toLowerCase() !== 'lốp xe nâng');
    score += Math.min(24, shared.length * 8);
    if (current.kind !== item.kind && shared.length) score += 10;
    return { item, score };
  }).filter(entry => entry.score >= 24).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).map(entry => entry.item);
  return [...ranked.filter(item => item.kind === 'products').slice(0, 3), ...ranked.filter(item => item.kind === 'blog').slice(0, 3)];
}
