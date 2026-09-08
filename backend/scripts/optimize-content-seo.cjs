// Content data maintenance: preview by default; --apply saves metadata and contextual links.
const path = require('node:path');
const fs = require('node:fs');
const ts = require('typescript');
const production = process.argv.includes('--production');
require('dotenv').config({ path: path.join(__dirname, production ? '../.env.production' : '../.env.local') });
if (production && process.env.APP_ENV !== 'production') throw new Error('Production mode requires APP_ENV=production.');
const dbUrl = new URL(process.env.DATABASE_URL);
if (!production && !['localhost', '127.0.0.1', '[::1]'].includes(dbUrl.hostname)) throw new Error('This script only updates the local database.');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const { richTextHtml, richTextPlain } = require('../../frontend/src/lib/rich-text.ts');
const { contentKeywords, linkRelatedContent, slugify } = require('../../frontend/src/lib/content-seo.ts');

(async () => {
  const [products, posts] = await Promise.all([prisma.product.findMany(), prisma.post.findMany()]);
  if (production && process.argv.includes('--apply')) {
    const backupFile = process.env.SEO_BACKUP_FILE;
    if (!backupFile) throw new Error('Set SEO_BACKUP_FILE to save a production content backup before applying changes.');
    fs.writeFileSync(backupFile, JSON.stringify({ createdAt: new Date().toISOString(), products, posts }, null, 2), { mode: 0o600, flag: 'wx' });
    console.log('Production content backup saved.');
  }
  const originalSeo = new Map([...products.map(item => [`products:${item.id}`, item.seo]), ...posts.map(item => [`blog:${item.id}`, item.seo])]);
  // Editorial phrases drawn from these existing articles, used as contextual link anchors.
  const articleKeywords = {
    [slugify('Nên chọn lốp đặc hay lốp hơi cho xe nâng?')]: ['lốp đặc', 'lốp hơi', 'điều kiện vận hành'],
    [slugify('Cách đọc thông số lốp xe nâng trước khi thay')]: ['ký hiệu lốp', 'thông số lốp', 'kích thước lốp', 'chọn sai cấu hình'],
    [slugify('Khi nào nên dùng lốp xe nâng không để lại vệt?')]: ['lốp không để lại vệt', 'nền sạch', 'nền sáng', 'kho sạch'],
    [slugify('5 điểm cần kiểm tra ở mâm xe nâng trước khi ép lốp')]: ['kiểm tra mâm', 'kiểu mâm', 'ép lốp', 'mép mâm'],
    [slugify('Từ 2 vỏ xe nâng cũ đến một bánh xe rùa hoàn chỉnh')]: ['tái sử dụng lốp', 'vỏ xe nâng cũ', 'bánh xe rùa'],
  };
  for (const post of posts) post.seo = { ...(post.seo || {}), keywords: [...new Set([...contentKeywords(post), ...(articleKeywords[slugify(post.title)] || [])])] };
  const catalog = [...products.map(item => ({ ...item, kind: 'products' })), ...posts.map(item => ({ ...item, kind: 'blog' }))].filter(item => item.status === 'PUBLISHED');
  const report = { products: products.length, posts: posts.length, metadataUpdates: 0, descriptionsWithLinks: 0, applied: process.argv.includes('--apply') };
  for (const [kind, records, field, model] of [['products', products, 'description', prisma.product], ['blog', posts, 'content', prisma.post]]) {
    for (const item of records) {
      const original = item[field] || '';
      const linked = linkRelatedContent(original, catalog, { id: item.id, kind });
      const seo = { ...(item.seo || {}), title: item.seo?.title || item.name || item.title, description: item.seo?.description || richTextPlain(item.shortDescription || item.excerpt || original || item.name || item.title).slice(0, 160), keywords: contentKeywords(item), canonicalPath: `/${kind}/${item.slug}` };
      const data = { seo };
      if (linked !== richTextHtml(original)) { data[field] = linked; report.descriptionsWithLinks++; }
      if (JSON.stringify(seo) !== JSON.stringify(originalSeo.get(`${kind}:${item.id}`))) report.metadataUpdates++;
      if (report.applied && (data[field] !== undefined || JSON.stringify(seo) !== JSON.stringify(originalSeo.get(`${kind}:${item.id}`)))) await model.update({ where: { id: item.id }, data });
    }
  }
  console.log(JSON.stringify(report, null, 2));
})().finally(() => prisma.$disconnect()).catch(error => { console.error(error.message); process.exitCode = 1; });
