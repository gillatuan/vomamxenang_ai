import { Injectable, Logger } from '@nestjs/common';
import { DailyContentPlanStatus, DailyContentRunStatus, Prisma } from '@prisma/client';
import { BlogAiService } from '../ai/services/blog-ai.service';
import type { GeneratedBlog } from '../ai/types/ai.types';
import { PostsService } from '../posts/posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../content/content-alias';

const TZ = 'Asia/Ho_Chi_Minh';
const MAX_ATTEMPTS = 3; // Initial attempt plus at most two safe retries.
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

type Candidate = {
  title: string; topic: string; primaryKeyword: string; secondaryKeywords: string[];
  searchIntent: 'COMMERCIAL' | 'INFORMATIONAL' | 'COMPARISON' | 'PROBLEM_SOLUTION'; cluster: string;
  articleType: string; productRelated: boolean;
};

const candidates: Candidate[] = [
  { title: 'Cách đối chiếu lốp đặc xe nâng trước khi chọn cho kho', topic: 'Đối chiếu lốp đặc xe nâng với điều kiện kho trước khi yêu cầu tư vấn', primaryKeyword: 'lốp đặc xe nâng', secondaryKeywords: ['vỏ xe nâng cho kho', 'kiểm tra mâm xe nâng'], searchIntent: 'COMMERCIAL', cluster: 'VỎ XE NÂNG', articleType: 'Commercial guide', productRelated: true },
  { title: 'Cách chuẩn bị ảnh và thông tin trước khi hỏi vỏ xe nâng', topic: 'Chuẩn bị thông tin cho tư vấn vỏ xe nâng', primaryKeyword: 'tư vấn vỏ xe nâng', secondaryKeywords: ['thông số lốp xe nâng', 'mâm xe nâng'], searchIntent: 'INFORMATIONAL', cluster: 'VỎ XE NÂNG', articleType: 'Supporting guide', productRelated: false },
  { title: 'Mâm xe nâng cũ: các điểm cần quan sát trước khi đối chiếu', topic: 'Những điểm quan sát thực tế khi cần đối chiếu mâm xe nâng cũ', primaryKeyword: 'mâm xe nâng cũ', secondaryKeywords: ['kiểm tra mâm xe nâng', 'bánh xe nâng'], searchIntent: 'COMMERCIAL', cluster: 'MÂM XE NÂNG', articleType: 'Commercial guide', productRelated: true },
  { title: 'Xe nâng rung khi di chuyển: những thông tin cần ghi nhận', topic: 'Hướng dẫn ghi nhận hiện tượng rung để trao đổi với kỹ thuật viên', primaryKeyword: 'xe nâng bị rung', secondaryKeywords: ['bánh xe nâng', 'kiểm tra lốp xe nâng'], searchIntent: 'PROBLEM_SOLUTION', cluster: 'PHỤ TÙNG XE NÂNG', articleType: 'Problem / solution', productRelated: false },
  { title: 'Cách đọc thông tin trên hông lốp xe nâng mà không suy đoán', topic: 'Giải thích cách ghi nhận ký hiệu hông lốp trước khi thay', primaryKeyword: 'thông số lốp xe nâng', secondaryKeywords: ['size lốp xe nâng', 'vỏ xe nâng'], searchIntent: 'INFORMATIONAL', cluster: 'VỎ XE NÂNG', articleType: 'Supporting guide', productRelated: false },
  { title: 'Khi nào cần đối chiếu cả lốp và mâm xe nâng?', topic: 'Giải thích vì sao lốp và mâm cần được kiểm tra như một cụm', primaryKeyword: 'vỏ mâm xe nâng', secondaryKeywords: ['mâm xe nâng', 'vỏ xe nâng'], searchIntent: 'COMPARISON', cluster: 'MÂM XE NÂNG', articleType: 'Comparison guide', productRelated: true },
  { title: 'Lốp xe nâng cũ: thông tin nào cần xác minh trước khi xem hàng', topic: 'Các thông tin cần xác minh với lốp xe nâng cũ, không suy đoán chất lượng', primaryKeyword: 'lốp xe nâng cũ', secondaryKeywords: ['vỏ xe nâng cũ', 'kiểm tra lốp xe nâng'], searchIntent: 'COMMERCIAL', cluster: 'VỎ XE NÂNG', articleType: 'Commercial guide', productRelated: true },
  { title: 'Cách lập ghi chú bảo trì cho bánh xe nâng', topic: 'Hướng dẫn ghi nhận ngày thay, vị trí bánh và dấu hiệu vận hành', primaryKeyword: 'bảo trì bánh xe nâng', secondaryKeywords: ['bảo trì xe nâng', 'lốp xe nâng'], searchIntent: 'INFORMATIONAL', cluster: 'PHỤ TÙNG XE NÂNG', articleType: 'Supporting guide', productRelated: false },
  { title: 'Mâm xe nâng và vị trí bánh: vì sao cần xác định đúng trước khi thay', topic: 'Cách xác định vị trí bánh và thông tin mâm khi cần thay thế', primaryKeyword: 'mâm xe nâng', secondaryKeywords: ['vị trí bánh xe nâng', 'bánh xe nâng'], searchIntent: 'COMMERCIAL', cluster: 'MÂM XE NÂNG', articleType: 'Commercial guide', productRelated: true },
  { title: 'Bảo quản vỏ xe nâng trong kho: những điều chỉ nên kết luận khi có dữ liệu', topic: 'Nguyên tắc ghi nhận và bảo quản vỏ xe nâng trong kho một cách trung thực', primaryKeyword: 'bảo quản vỏ xe nâng', secondaryKeywords: ['kho vỏ lốp xe nâng', 'lốp xe nâng'], searchIntent: 'INFORMATIONAL', cluster: 'VỎ XE NÂNG', articleType: 'Supporting guide', productRelated: false },
];

const plain = (html: string) => html.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim();
const wordCount = (html: string) => plain(html).match(/[\p{L}\p{N}]+/gu)?.length || 0;
const linksFrom = (html: string) => [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/giu)].map((match) => match[1]);
const vnDate = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

@Injectable()
export class DailyContentService {
  private readonly logger = new Logger(DailyContentService.name);
  constructor(private readonly db: PrismaService, private readonly blogAi: BlogAiService, private readonly posts: PostsService) {}

  async current() {
    return this.db.dailyContentRun.findFirst({ orderBy: { startedAt: 'desc' }, include: { plans: { include: { post: { select: { id: true, title: true, slug: true, status: true } }, targetProduct: { select: { id: true, name: true, slug: true } } }, orderBy: { slot: 'asc' } } } });
  }

  async run(runDate = vnDate()) {
    let run = await this.db.dailyContentRun.findUnique({ where: { runDate }, include: { plans: true } });
    if (run?.status === DailyContentRunStatus.COMPLETED) return { run, reused: true };
    if (run?.status === DailyContentRunStatus.RUNNING) return { run, reused: true, running: true };
    if (!run) {
      try { run = await this.db.dailyContentRun.create({ data: { runDate, status: DailyContentRunStatus.RUNNING }, include: { plans: true } }); }
      catch { run = await this.db.dailyContentRun.findUniqueOrThrow({ where: { runDate }, include: { plans: true } }); return { run, reused: true, running: run.status === DailyContentRunStatus.RUNNING }; }
    } else {
      run = await this.db.dailyContentRun.update({ where: { id: run.id }, data: { status: DailyContentRunStatus.RUNNING, error: null, finishedAt: null }, include: { plans: true } });
    }

    try {
      if (!run.plans.length) await this.createPlans(run.id);
      const plans = await this.db.dailyContentPlan.findMany({ where: { runId: run.id }, orderBy: { slot: 'asc' } });
      for (const plan of plans) if (!plan.postId && plan.status !== DailyContentPlanStatus.FAILED) await this.generatePlan(plan.id);
      const complete = await this.db.dailyContentPlan.findMany({ where: { runId: run.id }, orderBy: { slot: 'asc' } });
      const successful = complete.filter((plan) => Boolean(plan.postId)).length;
      const failed = complete.filter((plan) => plan.status === DailyContentPlanStatus.FAILED).length;
      const status = successful === 2 && failed === 0 ? DailyContentRunStatus.COMPLETED : successful ? DailyContentRunStatus.PARTIAL : DailyContentRunStatus.FAILED;
      const updated = await this.db.dailyContentRun.update({ where: { id: run.id }, data: { status, finishedAt: new Date(), summary: json({ planned: complete.length, savedDrafts: successful, failed, timezone: TZ }) }, include: { plans: { include: { post: true }, orderBy: { slot: 'asc' } } } });
      return { run: updated, reused: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Daily content job failed.';
      await this.db.dailyContentRun.update({ where: { id: run.id }, data: { status: DailyContentRunStatus.FAILED, error: message, finishedAt: new Date() } });
      throw error;
    }
  }

  private async createPlans(runId: string) {
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const [posts, existingPlans, products] = await Promise.all([
      this.db.post.findMany({ select: { title: true, slug: true, tags: true, seo: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
      this.db.dailyContentPlan.findMany({ where: { createdAt: { gte: since } }, select: { title: true, slug: true, primaryKeyword: true, searchIntent: true } }),
      this.db.product.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, name: true, slug: true, shortDescription: true, description: true, size: true, brand: true, tireType: true, rimType: true, condition: true, imageUrl: true, seo: true }, orderBy: { createdAt: 'desc' } }),
    ]);
    const known = [...posts.map((post) => ({ title: post.title, slug: post.slug || '', primaryKeyword: typeof (post.seo as Record<string, unknown> | null)?.primaryKeyword === 'string' ? String((post.seo as Record<string, unknown>).primaryKeyword) : '', searchIntent: '' })), ...existingPlans];
    const available = candidates.filter((candidate) => !this.collides(candidate, known));
    const first = available.find((candidate) => candidate.productRelated) || available[0];
    const second = available.find((candidate) => candidate !== first && !candidate.productRelated && candidate.cluster !== first?.cluster) || available.find((candidate) => candidate !== first);
    if (!first || !second || products.length === 0) throw new Error('Không đủ chủ đề hoặc sản phẩm thật để lập 2 bài không trùng cho ngày này.');
    const selected = [first, second];
    await this.db.dailyContentPlan.createMany({ data: selected.map((candidate, index) => ({ runId, slot: index + 1, title: candidate.title, slug: slugify(candidate.title), topic: candidate.topic, primaryKeyword: candidate.primaryKeyword, secondaryKeywords: candidate.secondaryKeywords, searchIntent: candidate.searchIntent, cluster: candidate.cluster, targetProductId: candidate.productRelated ? products[index % products.length].id : null, status: DailyContentPlanStatus.PLANNED })) });
  }

  private collides(candidate: Candidate, known: Array<{ title: string; slug: string | null; primaryKeyword: string; searchIntent: string }>) {
    const titleTokens = new Set(slugify(candidate.title).split('-').filter((token) => token.length > 2));
    return known.some((item) => {
      if (item.slug === slugify(candidate.title)) return true;
      if (item.primaryKeyword.toLocaleLowerCase('vi') === candidate.primaryKeyword.toLocaleLowerCase('vi') && item.searchIntent === candidate.searchIntent) return true;
      const other = new Set(slugify(item.title).split('-').filter((token) => token.length > 2));
      const intersection = [...titleTokens].filter((token) => other.has(token)).length;
      return intersection / Math.max(titleTokens.size, other.size, 1) >= .72;
    });
  }

  private async generatePlan(planId: string) {
    const plan = await this.db.dailyContentPlan.findUniqueOrThrow({ where: { id: planId }, include: { targetProduct: true } });
    const [publishedPosts, publishedProducts] = await Promise.all([
      this.db.post.findMany({ where: { status: 'PUBLISHED' }, select: { title: true, slug: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
      this.db.product.findMany({ where: { status: 'PUBLISHED' }, select: { name: true, slug: true }, orderBy: { createdAt: 'desc' }, take: 30 }),
    ]);
    const links = this.linksFor(plan.cluster, plan.targetProduct, publishedPosts, publishedProducts);
    await this.db.dailyContentPlan.update({ where: { id: plan.id }, data: { status: DailyContentPlanStatus.GENERATING, attempts: { increment: 1 }, internalLinks: json(links) } });
    const input = {
      topic: plan.topic, category: plan.cluster,
      shortBrief: this.brief(plan, links), primaryKeyword: plan.primaryKeyword, secondaryKeywords: plan.secondaryKeywords,
      targetAudience: 'Người phụ trách xe nâng, kho và mua phụ tùng tại Việt Nam', articleType: plan.searchIntent,
      relatedProduct: plan.targetProduct ? `${plan.targetProduct.name} (${plan.targetProduct.slug ? `/products/${plan.targetProduct.slug}` : 'chưa có URL public'})` : '',
      tones: ['Professional', 'Workshop / Real-world'], notes: 'Chỉ dùng dữ liệu sản phẩm được cung cấp. Không bịa thông số, giá, tồn kho, thương hiệu, xuất xứ, tình trạng, case study hoặc kết quả. Bài phải có đúng một H1, tối thiểu ba H2, kết luận và một CTA tự nhiên. Viết tiếng Việt tự nhiên, không dùng lời sáo rỗng.',
    };
    let output: GeneratedBlog | undefined; let lastError = '';
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try { output = await this.blogAi.generate(input); break; }
      catch (error) { lastError = error instanceof Error ? error.message : 'AI generation failed'; this.logger.warn({ planId, attempt, error: lastError }); }
    }
    if (!output) {
      await this.db.dailyContentPlan.update({ where: { id: plan.id }, data: { status: DailyContentPlanStatus.FAILED, attempts: MAX_ATTEMPTS, failureReason: lastError || 'AI generation failed after retries.' } });
      return;
    }
    const content = this.appendLinks(output.content, links);
    const quality = this.qualityGate({ ...output, content }, plan, links);
    const post = await this.posts.create({ title: output.title, slug: output.slug, excerpt: output.excerpt, content, tableOfContents: output.tableOfContents, seo: { ...output.seo, keywords: [plan.primaryKeyword, ...plan.secondaryKeywords], primaryKeyword: plan.primaryKeyword, secondaryKeywords: plan.secondaryKeywords, robots: 'noindex,follow' }, tags: [...new Set([plan.cluster.toLowerCase(), plan.primaryKeyword, ...output.tags])], status: 'DRAFT' });
    await this.db.dailyContentPlan.update({ where: { id: plan.id }, data: { postId: post.id, status: DailyContentPlanStatus.DRAFT, quality: json(quality), failureReason: quality.passed ? null : quality.reasons.join(' | ') } });
  }

  private brief(plan: { title: string; topic: string; searchIntent: string; targetProduct: Record<string, unknown> | null }, links: Array<{ href: string; label: string }>) {
    const product = plan.targetProduct ? { name: plan.targetProduct.name, slug: plan.targetProduct.slug, shortDescription: plan.targetProduct.shortDescription, description: plan.targetProduct.description, size: plan.targetProduct.size, brand: plan.targetProduct.brand, tireType: plan.targetProduct.tireType, rimType: plan.targetProduct.rimType, condition: plan.targetProduct.condition, imageUrl: plan.targetProduct.imageUrl } : null;
    return `Tiêu đề dự kiến: ${plan.title}. Intent: ${plan.searchIntent}. Chủ đề: ${plan.topic}. Dữ liệu sản phẩm đã xác minh (có thể null): ${JSON.stringify(product)}. Chỉ được dùng các URL internal link sau: ${JSON.stringify(links)}. Nếu thiếu dữ liệu, viết theo hướng hướng dẫn/đối chiếu chung và không đưa ra tuyên bố sản phẩm.`;
  }

  private linksFor(cluster: string, product: { name: string; slug: string | null } | null, posts: Array<{ title: string; slug: string | null }>, products: Array<{ name: string; slug: string | null }>) {
    const links = cluster === 'MÂM XE NÂNG' ? [{ href: '/mam-xe-nang', label: 'mâm xe nâng' }, { href: '/products', label: 'danh mục sản phẩm và dịch vụ' }] : [{ href: '/vo-xe-nang', label: 'vỏ xe nâng' }, { href: '/products', label: 'danh mục sản phẩm và dịch vụ' }];
    if (product?.slug) links.unshift({ href: `/products/${product.slug}`, label: product.name });
    const related = posts.find((post) => post.slug && !post.slug.includes('ngay-1'));
    if (related?.slug && links.length < 5) links.push({ href: `/blog/${related.slug}`, label: related.title });
    const fallbackProduct = products.find((item) => item.slug && item.slug !== product?.slug);
    if (fallbackProduct?.slug && links.length < 5) links.push({ href: `/products/${fallbackProduct.slug}`, label: fallbackProduct.name });
    return links.slice(0, 5);
  }

  private appendLinks(content: string, links: Array<{ href: string; label: string }>) {
    const missing = links.filter((link) => !content.includes(`href="${link.href}"`) && !content.includes(`href='${link.href}'`));
    if (!missing.length) return content;
    return `${content}<section><h2>Tham khảo thêm</h2><p>${missing.map((link) => `<a href="${link.href}">${link.label}</a>`).join(' · ')}</p></section>`;
  }

  private qualityGate(output: GeneratedBlog, plan: { primaryKeyword: string }, links: Array<{ href: string }>) {
    const actualLinks = linksFrom(output.content); const allowed = new Set(links.map((link) => link.href));
    const reasons: string[] = [];
    if (!output.title.trim() || !output.excerpt.trim() || !output.slug || !/^[-a-z0-9]+$/u.test(output.slug)) reasons.push('Thiếu title, excerpt hoặc slug hợp lệ.');
    if (wordCount(output.content) < 900) reasons.push('Nội dung dưới 900 từ.');
    if ((output.content.match(/<h1(?:\s[^>]*)?>/giu) || []).length !== 1) reasons.push('Nội dung phải có đúng một H1.');
    if ((output.content.match(/<h2(?:\s[^>]*)?>/giu) || []).length < 3) reasons.push('Nội dung cần tối thiểu ba H2.');
    if (!output.seo.title?.trim() || !output.seo.description?.trim() || !output.seo.primaryKeyword?.trim()) reasons.push('Thiếu SEO metadata.');
    if (!plain(output.content).toLocaleLowerCase('vi').includes(plan.primaryKeyword.toLocaleLowerCase('vi'))) reasons.push('Primary keyword không xuất hiện tự nhiên trong nội dung.');
    if (actualLinks.length < 2 || actualLinks.length > 5 || actualLinks.some((href) => !allowed.has(href))) reasons.push('Internal link không nằm trong tập URL đã xác minh.');
    if (/\[CẦN (?:THÊM|BỔ SUNG) THÔNG TIN\]/iu.test(output.content) || output.missingInformation.length) reasons.push('Còn thông tin chưa xác minh.');
    return { passed: reasons.length === 0, reasons, wordCount: wordCount(output.content), internalLinks: actualLinks, generatedAt: new Date().toISOString() };
  }
}
