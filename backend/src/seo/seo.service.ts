import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SeoAuditScope, SeoAuditStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { fetchPublic } from './public-fetch';
import { analyzePage, Content, keywordMap, InternalLinkRecommendationService, pagePath, SITE } from './seo-analysis';
import { CreateContentCampaignDto, UpdateContentCampaignDto } from './dto/campaign.dto';
import { CreateInternalLinkSuggestionDto, UpdateInternalLinkSuggestionDto } from './dto/internal-link.dto';
import { CreateContentSeoAuditDto } from './dto/seo-audit.dto';
import { CreateSeoKeywordDto, UpdateSeoKeywordDto } from './dto/seo-keyword.dto';
import { ListSeoKeywordsDto, PaginationDto } from './dto/list-seo.dto';
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

type SeoRecord = Record<string, unknown>;
type ContentAuditIssue = { code: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; detail: string };

function seoRecord(value: Prisma.JsonValue | null): SeoRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as unknown as SeoRecord
    : {};
}

function headingsFrom(content: string): number[] {
  return [...content.matchAll(/<h([1-6])(?:\s[^>]*)?>/giu)].map((match) => Number(match[1]));
}

function internalLinksFrom(content: string): string[] {
  return [...content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/giu)]
    .map((match) => match[1])
    .filter((href) => href.startsWith('/') || href.startsWith(SITE));
}
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

  products() {
    return this.db.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, imageUrl: true, seo: true, tags: true, status: true, createdAt: true },
    });
  }

  posts() {
    return this.db.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, slug: true, seo: true, tags: true, status: true, createdAt: true },
    });
  }

  async listKeywords(query: ListSeoKeywordsDto) {
    const skip = (query.page - 1) * query.limit;
    const where = query.status ? { status: query.status } : undefined;
    const [items, total] = await this.db.$transaction([
      this.db.seoKeyword.findMany({ where, skip, take: query.limit, orderBy: [{ priority: 'desc' }, { keyword: 'asc' }], include: { product: { select: { id: true, name: true, slug: true } }, post: { select: { id: true, title: true, slug: true } } } }),
      this.db.seoKeyword.count({ where }),
    ]);
    return { items, page: query.page, limit: query.limit, total };
  }

  async createKeyword(dto: CreateSeoKeywordDto) {
    await this.assertKeywordTarget(dto);
    return this.db.seoKeyword.create({ data: dto, include: { product: { select: { id: true, name: true, slug: true } }, post: { select: { id: true, title: true, slug: true } } } });
  }

  async updateKeyword(id: string, dto: UpdateSeoKeywordDto) {
    const existing = await this.db.seoKeyword.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy từ khoá SEO.');
    const target = { productId: dto.productId ?? existing.productId ?? undefined, postId: dto.postId ?? existing.postId ?? undefined };
    await this.assertKeywordTarget(target);
    return this.db.seoKeyword.update({ where: { id }, data: dto, include: { product: { select: { id: true, name: true, slug: true } }, post: { select: { id: true, title: true, slug: true } } } });
  }

  async removeKeyword(id: string) {
    const existing = await this.db.seoKeyword.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy từ khoá SEO.');
    return this.db.seoKeyword.delete({ where: { id } });
  }

  async listAudits(query: PaginationDto) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.db.$transaction([
      this.db.seoAudit.findMany({ skip, take: query.limit, orderBy: { createdAt: 'desc' }, include: { product: { select: { id: true, name: true, slug: true } }, post: { select: { id: true, title: true, slug: true } } } }),
      this.db.seoAudit.count(),
    ]);
    return { items, page: query.page, limit: query.limit, total };
  }

  async getAudit(id: string) {
    const audit = await this.db.seoAudit.findUnique({ where: { id }, include: { product: { select: { id: true, name: true, slug: true } }, post: { select: { id: true, title: true, slug: true } } } });
    if (!audit) throw new NotFoundException('Không tìm thấy SEO audit.');
    return audit;
  }

  async createContentAudit(dto: CreateContentSeoAuditDto) {
    const isProduct = dto.sourceType === 'PRODUCT';
    const source = isProduct
      ? await this.db.product.findUnique({ where: { id: dto.sourceId } })
      : await this.db.post.findUnique({ where: { id: dto.sourceId } });
    if (!source) throw new NotFoundException('Không tìm thấy nội dung để audit.');

    const sourceId = source.id;
    const title = isProduct
      ? (source as { name: string }).name
      : (source as { title: string }).title;
    const slug = source.slug || sourceId;
    const path = isProduct ? `/products/${slug}` : `/blog/${slug}`;
    const metadata = seoRecord(source.seo);
    const content = isProduct
      ? (source as { description: string | null }).description || ''
      : (source as { content: string }).content;
    const headings = headingsFrom(content);
    const internalLinks = internalLinksFrom(content);
    const issues: ContentAuditIssue[] = [];
    const metaTitle = typeof metadata.title === 'string' ? metadata.title : '';
    const metaDescription = typeof metadata.description === 'string' ? metadata.description : '';
    const canonical = typeof metadata.canonicalPath === 'string' ? metadata.canonicalPath : '';
    const primaryKeyword = typeof metadata.primaryKeyword === 'string' ? metadata.primaryKeyword : '';
    const imageAlt = typeof metadata.imageAlt === 'string' ? metadata.imageAlt : '';
    if (!metaTitle) issues.push({ code: 'MISSING_META_TITLE', severity: 'HIGH', detail: 'Thiếu meta title trong SEO metadata.' });
    if (!metaDescription) issues.push({ code: 'MISSING_META_DESCRIPTION', severity: 'HIGH', detail: 'Thiếu meta description trong SEO metadata.' });
    if (!primaryKeyword) issues.push({ code: 'MISSING_PRIMARY_KEYWORD', severity: 'MEDIUM', detail: 'Chưa khai báo primary keyword.' });
    if (!canonical) issues.push({ code: 'MISSING_CANONICAL', severity: 'MEDIUM', detail: 'Chưa khai báo canonicalPath.' });
    if (isProduct && !imageAlt) issues.push({ code: 'MISSING_IMAGE_ALT', severity: 'MEDIUM', detail: 'Sản phẩm chưa có imageAlt trong SEO metadata.' });
    if (headings.length === 0) issues.push({ code: 'MISSING_HEADINGS', severity: 'LOW', detail: 'Nội dung lưu trữ chưa có heading HTML để kiểm tra cấu trúc.' });
    if (internalLinks.length === 0) issues.push({ code: 'NO_INTERNAL_LINKS', severity: 'MEDIUM', detail: 'Nội dung lưu trữ chưa có internal link; cần review thủ công.' });
    const score = Math.max(0, 100 - issues.reduce((total, issue) => total + ({ HIGH: 20, MEDIUM: 10, LOW: 4 }[issue.severity]), 0));
    const report = { auditedAt: new Date().toISOString(), sourceType: dto.sourceType, sourceId, subjectUrl: `${SITE}${path}`, title, checks: { headings, internalLinks }, issues, score, scope: 'Stored Product/Post content and metadata only; public HTML crawl is not run by this endpoint.' };
    return this.db.seoAudit.create({
      data: {
        scope: isProduct ? SeoAuditScope.PRODUCT : SeoAuditScope.POST,
        status: SeoAuditStatus.COMPLETED,
        productId: isProduct ? sourceId : null,
        postId: isProduct ? null : sourceId,
        subjectUrl: `${SITE}${path}`,
        primaryKeyword: primaryKeyword || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        canonical: canonical || null,
        imageAlt: imageAlt || null,
        headingStructure: json({ levels: headings }),
        internalLinks: json(internalLinks),
        issues: json(issues),
        score,
        report: json(report),
      },
    });
  }

  async createInternalLink(dto: CreateInternalLinkSuggestionDto) {
    if (dto.sourceType === dto.targetType && dto.sourceId === dto.targetId) throw new BadRequestException('Nguồn và đích internal link phải khác nhau.');
    await Promise.all([
      this.assertSeoContentExists(dto.sourceType, dto.sourceId, 'Nội dung nguồn không tồn tại.'),
      this.assertSeoContentExists(dto.targetType, dto.targetId, 'Nội dung đích không tồn tại.'),
    ]);
    const existing = await this.db.internalLinkSuggestion.findUnique({ where: { sourceType_sourceId_targetType_targetId: { sourceType: dto.sourceType, sourceId: dto.sourceId, targetType: dto.targetType, targetId: dto.targetId } } });
    if (existing) throw new ConflictException('Gợi ý internal link này đã tồn tại.');
    return this.db.internalLinkSuggestion.create({ data: dto });
  }

  async updateInternalLink(id: string, dto: UpdateInternalLinkSuggestionDto) {
    const existing = await this.db.internalLinkSuggestion.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy gợi ý internal link.');
    return this.db.internalLinkSuggestion.update({ where: { id }, data: dto });
  }

  async listCampaigns(query: PaginationDto) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.db.$transaction([
      this.db.contentCampaign.findMany({ skip, take: query.limit, orderBy: { createdAt: 'desc' }, include: { posts: { orderBy: { sortOrder: 'asc' }, include: { post: { select: { id: true, title: true, slug: true, status: true } } } } } }),
      this.db.contentCampaign.count(),
    ]);
    return { items, page: query.page, limit: query.limit, total };
  }

  async getCampaign(id: string) {
    const campaign = await this.db.contentCampaign.findUnique({ where: { id }, include: { posts: { orderBy: { sortOrder: 'asc' }, include: { post: { select: { id: true, title: true, slug: true, status: true } } } } } });
    if (!campaign) throw new NotFoundException('Không tìm thấy content campaign.');
    return campaign;
  }

  async createCampaign(dto: CreateContentCampaignDto) {
    this.assertCampaignDates(dto.startsAt, dto.endsAt);
    await this.assertCampaignPosts(dto.posts);
    return this.db.contentCampaign.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        goal: dto.goal,
        status: dto.status,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        posts: dto.posts ? { create: this.campaignPostsData(dto.posts) } : undefined,
      },
      include: { posts: { orderBy: { sortOrder: 'asc' }, include: { post: { select: { id: true, title: true, slug: true, status: true } } } } },
    });
  }

  async updateCampaign(id: string, dto: UpdateContentCampaignDto) {
    const existing = await this.getCampaign(id);
    this.assertCampaignDates(dto.startsAt ?? existing.startsAt?.toISOString(), dto.endsAt ?? existing.endsAt?.toISOString());
    await this.assertCampaignPosts(dto.posts);
    return this.db.contentCampaign.update({ data: { ...this.campaignData(dto), ...(dto.posts ? { posts: { deleteMany: {}, create: this.campaignPostsData(dto.posts) } } : {}) }, where: { id }, include: { posts: { orderBy: { sortOrder: 'asc' }, include: { post: { select: { id: true, title: true, slug: true, status: true } } } } } });
  }

  private async assertKeywordTarget(target: { productId?: string; postId?: string }) {
    if (target.productId && target.postId) throw new BadRequestException('Một keyword chỉ được liên kết với Product hoặc Post, không phải cả hai.');
    if (target.productId && !await this.db.product.findUnique({ where: { id: target.productId }, select: { id: true } })) throw new NotFoundException('Product liên kết không tồn tại.');
    if (target.postId && !await this.db.post.findUnique({ where: { id: target.postId }, select: { id: true } })) throw new NotFoundException('Post liên kết không tồn tại.');
  }

  private async assertCampaignPosts(posts?: CreateContentCampaignDto['posts']) {
    if (!posts?.length) return;
    const found = await this.db.post.findMany({ where: { id: { in: posts.map((post) => post.postId) } }, select: { id: true } });
    if (found.length !== posts.length) throw new NotFoundException('Một hoặc nhiều Post trong campaign không tồn tại.');
  }

  private async assertSeoContentExists(type: 'PRODUCT' | 'POST', id: string, message: string) {
    const content = type === 'PRODUCT'
      ? await this.db.product.findUnique({ where: { id }, select: { id: true } })
      : await this.db.post.findUnique({ where: { id }, select: { id: true } });
    if (!content) throw new NotFoundException(message);
  }

  private assertCampaignDates(startsAt?: string, endsAt?: string) {
    if (!startsAt || !endsAt) return;
    if (new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
      throw new BadRequestException('Ngày kết thúc campaign phải sau hoặc bằng ngày bắt đầu.');
    }
  }

  private campaignPostsData(posts: NonNullable<CreateContentCampaignDto['posts']>) {
    return posts.map((post, index) => ({ postId: post.postId, sortOrder: post.sortOrder ?? index, plannedAt: post.plannedAt ? new Date(post.plannedAt) : undefined, notes: post.notes }));
  }

  private campaignData(dto: CreateContentCampaignDto | UpdateContentCampaignDto) {
    return {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      goal: dto.goal,
      status: dto.status,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    };
  }
}
