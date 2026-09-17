import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/auth/roles.guard';
import { CreateContentCampaignDto } from '../src/seo/dto/campaign.dto';
import { CreateSeoKeywordDto } from '../src/seo/dto/seo-keyword.dto';
import { SeoService } from '../src/seo/seo.service';

function fakePrisma() {
  const createdKeywords: Array<Record<string, unknown>> = [];
  const createdAudits: Array<Record<string, unknown>> = [];
  const createdLinks: Array<Record<string, unknown>> = [];
  const createdCampaigns: Array<Record<string, unknown>> = [];
  return {
    product: {
      findUnique: async ({ where }: { where: { id: string } }) => where.id === 'product-1'
        ? { id: 'product-1', name: 'Lốp đặc 6.00-9', slug: 'lop-dac-6-00-9', description: '<h2>Thông số</h2><p>Mô tả</p>', seo: { title: 'Lốp đặc 6.00-9', description: 'Mô tả SEO', primaryKeyword: 'lốp đặc xe nâng', canonicalPath: '/products/lop-dac-6-00-9', imageAlt: 'Lốp đặc xe nâng' } }
        : null,
    },
    post: {
      findUnique: async ({ where }: { where: { id: string } }) => where.id === 'post-1'
        ? { id: 'post-1', title: 'Hướng dẫn chọn lốp', slug: 'huong-dan-chon-lop', content: '<h2>Hướng dẫn</h2><a href="/products/lop-dac-6-00-9">Lốp đặc</a>', seo: { title: 'Hướng dẫn chọn lốp', description: 'Mô tả SEO', primaryKeyword: 'chọn lốp xe nâng', canonicalPath: '/blog/huong-dan-chon-lop' } }
        : null,
      findMany: async ({ where }: { where: { id: { in: string[] } } }) => where.id.in.map((id) => ({ id })),
    },
    seoAudit: { create: async ({ data }: { data: Record<string, unknown> }) => { createdAudits.push(data); return { id: 'audit-1', ...data }; } },
    seoKeyword: {
      create: async ({ data }: { data: Record<string, unknown> }) => { createdKeywords.push(data); return { id: 'keyword-1', ...data }; },
      findUnique: async () => null,
    },
    internalLinkSuggestion: {
      findUnique: async () => null,
      create: async ({ data }: { data: Record<string, unknown> }) => { createdLinks.push(data); return { id: 'link-1', ...data }; },
    },
    contentCampaign: {
      create: async ({ data }: { data: Record<string, unknown> }) => { createdCampaigns.push(data); return { id: 'campaign-1', ...data }; },
    },
    __created: { createdKeywords, createdAudits, createdLinks, createdCampaigns },
  };
}

async function validationChecks() {
  const invalidKeyword = plainToInstance(CreateSeoKeywordDto, { keyword: '', targetUrl: 'not-a-url', priority: 10 });
  assert((await validate(invalidKeyword)).length >= 3, 'Keyword DTO must reject malformed values.');

  const invalidCampaign = plainToInstance(CreateContentCampaignDto, {
    name: 'A', slug: '', posts: [{ postId: 'post-1' }, { postId: 'post-1' }],
  });
  assert((await validate(invalidCampaign)).length >= 2, 'Campaign DTO must reject an invalid slug and duplicate post IDs.');
}

async function serviceChecks() {
  const fake = fakePrisma();
  const service = new SeoService(fake as unknown as PrismaService);

  const keyword = await service.createKeyword({ keyword: 'lốp đặc xe nâng', targetUrl: 'https://www.vomamxenang.com/lop-dac-xe-nang', productId: 'product-1' });
  assert.equal(keyword.id, 'keyword-1');
  assert.equal(fake.__created.createdKeywords.length, 1);
  await assert.rejects(() => service.createKeyword({ keyword: 'lỗi target kép', targetUrl: 'https://www.vomamxenang.com/', productId: 'product-1', postId: 'post-1' }));

  const audit = await service.createContentAudit({ sourceType: 'PRODUCT', sourceId: 'product-1' });
  assert.equal(audit.scope, 'PRODUCT');
  assert.equal(fake.__created.createdAudits[0].score, 90, 'Missing internal links must lower the stored audit score.');

  const link = await service.createInternalLink({ sourceType: 'POST', sourceId: 'post-1', targetType: 'PRODUCT', targetId: 'product-1', sourceUrl: 'https://www.vomamxenang.com/blog/huong-dan-chon-lop', targetUrl: 'https://www.vomamxenang.com/products/lop-dac-6-00-9', anchorText: 'Lốp đặc 6.00-9', reason: 'Cùng chủ đề', score: 90 });
  assert.equal(link.id, 'link-1');
  await assert.rejects(() => service.createInternalLink({ sourceType: 'POST', sourceId: 'missing-post', targetType: 'PRODUCT', targetId: 'product-1', sourceUrl: 'https://www.vomamxenang.com/blog/missing', targetUrl: 'https://www.vomamxenang.com/products/lop-dac-6-00-9', anchorText: 'Lốp đặc 6.00-9', reason: 'Nội dung nguồn không tồn tại', score: 90 }));
  await assert.rejects(() => service.createInternalLink({ sourceType: 'POST', sourceId: 'post-1', targetType: 'POST', targetId: 'post-1', sourceUrl: 'https://www.vomamxenang.com/blog/huong-dan-chon-lop', targetUrl: 'https://www.vomamxenang.com/blog/huong-dan-chon-lop', anchorText: 'Bài hiện tại', reason: 'Sai vì tự liên kết', score: 1 }));

  const campaign = await service.createCampaign({ name: 'Chuyển kho 2026', slug: 'chuyen-kho-2026', posts: [{ postId: 'post-1', sortOrder: 0 }] });
  assert.equal(campaign.id, 'campaign-1');
  assert.equal(fake.__created.createdCampaigns.length, 1);
  await assert.rejects(() => service.createCampaign({ name: 'Sai thời hạn', slug: 'sai-thoi-han', startsAt: '2026-12-02T00:00:00.000Z', endsAt: '2026-12-01T00:00:00.000Z' }));
}

function authorizationChecks() {
  const jwt = new JwtAuthGuard();
  assert.throws(() => jwt.handleRequest(null, null, null), /Invalid or missing token/, 'Unauthenticated request must be rejected.');
  const reflector = { getAllAndOverride: () => ['ADMIN_MANAGER'] };
  const guard = new RolesGuard(reflector as unknown as ConstructorParameters<typeof RolesGuard>[0]);
  const contextFor = (role?: string) => ({ getHandler: () => undefined, getClass: () => undefined, switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }) });
  assert.throws(() => guard.canActivate(contextFor('STOREKEEPER') as never), /Insufficient permissions/, 'Non-admin role must be rejected.');
  assert.equal(guard.canActivate(contextFor('ADMIN_MANAGER') as never), true, 'Admin role must be accepted.');
}

function migrationChecks() {
  const sql = readFileSync('prisma/migrations/20260916000100_add_seo_keyword_campaigns/migration.sql', 'utf8');
  for (const expected of ['CREATE TABLE "SeoKeyword"', 'CREATE TABLE "ContentCampaign"', 'CREATE TABLE "CampaignPost"', 'SeoKeyword_keyword_key', 'CampaignPost_campaignId_postId_key', 'SeoAudit_productId_fkey']) {
    assert(sql.includes(expected), `Migration must contain ${expected}.`);
  }
}

async function main() {
  await validationChecks();
  await serviceChecks();
  authorizationChecks();
  migrationChecks();
  console.log('SEO V3.1 Batch 1 tests passed: validation, services, RBAC and migration constraints.');
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
