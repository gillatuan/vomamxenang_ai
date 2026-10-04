import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

/**
 * Safety rule:
 * This migration must never invent product claims, applications, benefits,
 * marketing copy, or technical specifications. It only normalizes/indexes
 * facts that already exist in reviewed Product records.
 */
const clean = (value?: string | null) => (value || '').trim();
const unique = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.map((value) => clean(value)).filter(Boolean)));

function content(product: any) {
  const name = clean(product.name);
  const size = clean(product.size);
  const brand = clean(product.brand);
  const tireType = clean(product.tireType);
  const existingSeo = (product.seo || {}) as Record<string, any>;

  // Search terms are composed only from explicit product fields.
  const factualTerms = unique([name, size, brand, tireType]);
  const primaryKeyword = clean(existingSeo.primaryKeyword) || [name, size].filter(Boolean).join(' ');

  const seo = {
    ...existingSeo,
    // Do not synthesize prose descriptions. Preserve reviewed copy only.
    title: clean(existingSeo.title) || name,
    description: clean(existingSeo.description),
    primaryKeyword,
    keywords: unique([...(Array.isArray(existingSeo.keywords) ? existingSeo.keywords : []), ...factualTerms]),
    imageAlt: clean(existingSeo.imageAlt) || name,
  };

  const specifications = Array.isArray(product.specifications) && product.specifications.length
    ? product.specifications
    : [
        size ? { label: 'Kích thước', value: size } : null,
        brand ? { label: 'Thương hiệu', value: brand } : null,
        tireType ? { label: 'Loại lốp', value: tireType } : null,
      ].filter(Boolean);

  return {
    // Existing editorial content is authoritative. Never generate replacements.
    shortDescription: clean(product.shortDescription),
    description: clean(product.description),
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    specifications,
    applications: Array.isArray(product.applications) ? product.applications : [],
    seo,
    tags: product.tags?.length ? product.tags : factualTerms,
  };
}

async function main() {
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'asc' },
  });

  let changed = 0;
  for (const product of products) {
    const next = content(product);
    const data: any = {};
    const seo = (product.seo || {}) as any;

    // Intentionally do not fill descriptions/highlights/applications. Missing
    // editorial content must be researched/reviewed before it is stored.
    if (!Array.isArray(product.specifications) || product.specifications.length === 0) {
      if (next.specifications.length) data.specifications = next.specifications;
    }
    if (!seo.title || !seo.primaryKeyword || !seo.imageAlt || !Array.isArray(seo.keywords) || seo.keywords.length === 0) {
      data.seo = next.seo;
    }
    if (!product.tags?.length && next.tags.length) data.tags = next.tags;

    if (!Object.keys(data).length) continue;
    changed++;
    console.log(JSON.stringify({ sku: product.sku, name: product.name, fields: Object.keys(data) }));
    if (apply) await prisma.product.update({ where: { id: product.id }, data });
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    products: products.length,
    changed,
    policy: 'existing-product-facts-only',
  }));
}

main().finally(() => prisma.$disconnect());
