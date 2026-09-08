import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/, '');
}

// Serialize alias allocation per content type, including historical aliases.
export async function saveContent(prisma: PrismaService, kind: 'product' | 'post', input: any, id?: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`content-alias:${kind}`}))`;
    const model = tx[kind] as any;
    const current = id ? await model.findUnique({ where: { id } }) : null;
    if (id && !current) throw new NotFoundException('Không tìm thấy nội dung.');
    const { aliases: _aliases, id: _id, ...data } = input;
    const title = data.name ?? data.title ?? current?.name ?? current?.title;
    if (typeof title !== 'string' || !title.trim()) throw new BadRequestException('Tên / tiêu đề không được để trống.');
    if (data.slug !== undefined && typeof data.slug !== 'string') throw new BadRequestException('Alias phải là chuỗi ký tự.');
    const explicit = typeof data.slug === 'string' && data.slug.trim().length > 0;
    const base = explicit ? slugify(data.slug) : current?.slug && data.slug === undefined ? current.slug : slugify(title);
    if (!base) throw new BadRequestException('Alias cần có chữ cái hoặc chữ số.');
    let slug = base;
    let suffix = 2;
    while (await model.findFirst({ where: { ...(id ? { id: { not: id } } : {}), OR: [{ slug }, { aliases: { has: slug } }, { id: slug }] } })) {
      if (explicit) throw new ConflictException('Alias đã được sử dụng. Vui lòng chọn alias khác.');
      slug = `${base}-${suffix++}`;
    }
    data.slug = slug;
    data.aliases = [...new Set([...(current?.aliases || []), ...(current?.slug && current.slug !== slug ? [current.slug] : [])])];
    const oldSeo = current?.seo && typeof current.seo === 'object' ? current.seo : {};
    const suppliedSeo = data.seo && typeof data.seo === 'object' ? data.seo : {};
    const seo = { ...oldSeo, ...suppliedSeo };
    seo.title = seo.title || title;
    seo.keywords = Array.isArray(seo.keywords) ? seo.keywords : [seo.primaryKeyword, ...(seo.secondaryKeywords || []), title, ...(data.tags ?? current?.tags ?? []), data.brand ?? current?.brand, data.size ?? current?.size].filter(Boolean);
    // The canonical URL follows the current alias, including changes made by AI SEO.
    seo.canonicalPath = `/${kind === 'product' ? 'products' : 'blog'}/${slug}`;
    data.seo = seo;
    return id ? model.update({ where: { id }, data }) : model.create({ data });
  });
}
