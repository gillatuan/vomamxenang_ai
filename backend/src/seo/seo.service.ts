import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { fetchPublic } from './public-fetch';
import { analyzePage, Content, keywordMap, InternalLinkRecommendationService, pagePath, SITE } from './seo-analysis';
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
@Injectable()
export class SeoService {
  constructor(private readonly db: PrismaService) {}
  async catalog(): Promise<Content[]> {
    const [products, posts] = await Promise.all([this.db.product.findMany({ where: { status: 'PUBLISHED' } }), this.db.post.findMany({ where: { status: 'PUBLISHED' } })]);
    return [...products.map(p => ({ id: p.id, kind: 'PRODUCT' as const, title: p.name, path: `/products/${p.slug || p.id}`, content: p.description || '', seo: (p.seo || {}) as Record<string, unknown>, tags: p.tags, size: p.size, brand: p.brand, tireType: p.tireType })), ...posts.map(p => ({ id: p.id, kind: 'POST' as const, title: p.title, path: `/blog/${p.slug || p.id}`, content: p.content, seo: (p.seo || {}) as Record<string, unknown>, tags: p.tags }))];
  }
  async overview() {
    const [audit, opportunities, suggestions, live, catalog, rims] = await Promise.all([this.db.seoAudit.findFirst({ orderBy: { createdAt: 'desc' } }), this.db.backlinkOpportunity.count(), this.db.internalLinkSuggestion.count({ where: { status: 'PENDING' } }), this.db.backlink.count({ where: { isLive: true } }), this.catalog(), this.db.wheelRim.findMany({ select: { id: true, size: true, boltHoles: true, brand: true, compatibleModels: true } })]);
    return { audit, opportunities, suggestions, live, searchConsole: { connected: false, message: 'Chưa kết nối API; không có dữ liệu clicks, impressions hoặc thứ hạng.' }, keywordMap: keywordMap(catalog, rims), categories: 'Trang chủ đề: /vo-xe-nang, /lop-dac-xe-nang, /mam-xe-nang. Category vẫn là danh mục kho.' };
  }
  async audit() {
    const catalog = await this.catalog();
    const rims = await this.db.wheelRim.findMany({ select: { id: true, size: true, boltHoles: true, brand: true, compatibleModels: true } });
    const paths = ['/', '/products', '/blog', '/about', '/vo-xe-nang', '/lop-dac-xe-nang', '/mam-xe-nang', ...rims.map(rim => `/mam-xe-nang/${encodeURIComponent(rim.id)}`), ...catalog.map(i => i.path)];
    const pages: ReturnType<typeof analyzePage>[] = []; const unchecked: Array<{ path: string; error: string }> = [];
    // Small concurrency; no external links are crawled by a site audit.
    for (let start = 0; start < paths.length; start += 3) {
      await Promise.all(paths.slice(start, start + 3).map(async path => {
        try { const page = await fetchPublic(SITE + path); pages.push(analyzePage(path, page, catalog.find(i => i.path === path))); }
        catch (error) { unchecked.push({ path, error: (error as Error).message }); }
      }));
    }
    const known = new Map(pages.map(p => [p.path, p]));
    const extraLinks = [...new Set(pages.flatMap(p => p.outgoing))].filter(path => !paths.includes(path) && !/^\/(admin|auth|checkout)(\/|$)/.test(path)).slice(0, 100);
    const broken = new Set<string>(); const redirects: Record<string, string> = {};
    for (let start = 0; start < extraLinks.length; start += 3) {
      await Promise.all(extraLinks.slice(start, start + 3).map(async path => {
        try { const page = await fetchPublic(SITE + path); if (page.status >= 400) broken.add(path); else if (page.url !== SITE + path) redirects[path] = page.url; }
        catch (error) { unchecked.push({ path, error: (error as Error).message }); }
      }));
    }

    for (const page of pages) {
      page.outgoing = [...new Set(page.outgoing.map(path => redirects[path] ? pagePath(redirects[path]) || path : path))];
      page.contextual = [...new Set(page.contextual.map(path => redirects[path] ? pagePath(redirects[path]) || path : path))];
    }
    for (const page of pages) {
      page.incoming = pages.filter(p => p.path !== page.path && p.outgoing.includes(page.path)).map(p => p.path);
      page.contextualIncoming = pages.filter(p => p.path !== page.path && p.contextual.includes(page.path)).map(p => p.path);
      if (page.kind !== 'PAGE' && !page.incoming.length && !unchecked.length) page.issues.push({ code: 'ORPHAN_PAGE', severity: 'High', detail: 'Không có liên kết tới từ các trang public đã crawl (HTML server)' });
      if (page.kind !== 'PAGE' && !page.contextualIncoming.length) page.issues.push({ code: 'NO_CONTEXTUAL_INCOMING', severity: 'Medium', detail: 'Chưa có liên kết tới trong mô tả Product/Post; xem gợi ý source' });
      for (const other of ['title', 'meta'] as const) if (page[other] && pages.some(p => p.path !== page.path && p[other] === page[other])) page.issues.push({ code: `DUPLICATE_${other.toUpperCase()}`, severity: 'Medium', detail: 'Trùng nội dung với URL khác trong audit' });
      for (const link of page.outgoing) if (broken.has(link) || known.get(link)?.issues.some(i => i.code === 'HTTP_ERROR')) page.issues.push({ code: 'BROKEN_INTERNAL_LINK', severity: 'High', detail: link });
      page.score = Math.max(0, 100 - page.issues.reduce((sum, i) => sum + ({ Critical: 30, High: 15, Medium: 7, Low: 2 }[i.severity]), 0));
    }
    // Only report IMPLEMENTED when the stored source actually links to the current target.
    const previousSuggestions = await this.db.internalLinkSuggestion.findMany();
    for (const suggestion of previousSuggestions) {
      const source = pages.find(p => p.id === suggestion.sourceId && p.kind === suggestion.sourceType);
      const target = catalog.find(p => p.id === suggestion.targetId && p.kind === suggestion.targetType);
      const implemented = source && target && source.contextual.includes(target.path);
      if (implemented && suggestion.status !== 'IMPLEMENTED') await this.db.internalLinkSuggestion.update({ where: { id: suggestion.id }, data: { status: 'IMPLEMENTED', targetUrl: SITE + target.path } });
      else if (!implemented && suggestion.status === 'IMPLEMENTED' && source && target) await this.db.internalLinkSuggestion.update({ where: { id: suggestion.id }, data: { status: 'PENDING' } });
    }
    const suggested = new InternalLinkRecommendationService().recommend(catalog);
    for (const { existing: _existing, ...data } of suggested) await this.db.internalLinkSuggestion.upsert({ where: { sourceType_sourceId_targetType_targetId: { sourceType: data.sourceType, sourceId: data.sourceId, targetType: data.targetType, targetId: data.targetId } }, create: data, update: { ...data } });
    const report = { checkedAt: new Date().toISOString(), scope: 'Public server-rendered HTML + stored descriptions; external links excluded. Unknown fetches are not passes. No search-engine rankings.', pages: pages.sort((a, b) => a.path.localeCompare(b.path)), unchecked, keywordMap: keywordMap(catalog, rims), suggestions: suggested.length, redirects, additionalLinksChecked: extraLinks.length, issues: Object.fromEntries(['Critical', 'High', 'Medium', 'Low'].map(s => [s, pages.reduce((n, p) => n + p.issues.filter(i => i.severity === s).length, 0)])) };
    return this.db.seoAudit.create({ data: { report: json(report) } });
  }
  suggestions() { return this.db.internalLinkSuggestion.findMany({ orderBy: [{ status: 'asc' }, { score: 'desc' }] }); }
  async reviewSuggestion(id: string, status: string) {
    if (!['APPROVED', 'REJECTED'].includes(status)) throw new BadRequestException('Choose APPROVED or REJECTED; edit content explicitly after review');
    if (!await this.db.internalLinkSuggestion.findUnique({ where: { id } })) throw new NotFoundException();
    return this.db.internalLinkSuggestion.update({ where: { id }, data: { status } });
  }
}
