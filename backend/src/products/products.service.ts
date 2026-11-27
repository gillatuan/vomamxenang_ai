import { saveContent } from '../content/content-alias';
import { catalogProductType } from '../category/catalog-categories';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { condition?: string; categoryId?: string; q?: string; sort?: string; brand?: string; size?: string; tireType?: string; rimType?: string; minPrice?: number; maxPrice?: number }) {
    const { condition, categoryId, q, sort, brand, size, tireType, rimType, minPrice, maxPrice } = filters;
    const fallbackType = categoryId ? catalogProductType(categoryId) : undefined;
    // Include legacy unassigned products without rewriting their category IDs.
    // AND keeps category grouping separate from the text-search OR clauses.
    const categoryFilter = fallbackType
      ? { AND: [{ OR: [{ categoryId }, { categoryId: null, type: fallbackType }] }] }
      : categoryId ? { categoryId } : {};
    const where = { status: 'PUBLISHED' as const, ...(condition ? { condition } : {}), ...categoryFilter, ...(brand ? { brand } : {}), ...(size ? { size } : {}), ...(tireType ? { tireType } : {}), ...(rimType ? { rimType } : {}), ...((minPrice != null || maxPrice != null) ? { AND: [
      { OR: [
        { priceMin: { not: null }, priceMax: { not: null },
          ...(minPrice != null ? { priceMax: { gte: minPrice } } : {}),
          ...(maxPrice != null ? { priceMin: { lte: maxPrice } } : {}) },
        { priceMin: null, priceMax: null, sellingPrice: { not: null,
          ...(minPrice != null ? { gte: minPrice } : {}),
          ...(maxPrice != null ? { lte: maxPrice } : {}) } },
      ] },
    ] } : {}), ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { sku: { contains: q, mode: 'insensitive' as const } }, { brand: { contains: q, mode: 'insensitive' as const } }, { size: { contains: q, mode: 'insensitive' as const } }] } : {}) };
    return this.prisma.product.findMany({
      where,
      orderBy: sort === 'name' ? { name: 'asc' } : sort === 'price-asc' ? [{ priceMin: 'asc' }, { sellingPrice: 'asc' }] : sort === 'price-desc' ? [{ priceMax: 'desc' }, { sellingPrice: 'desc' }] : { createdAt: 'desc' },
      // Public catalog responses must never disclose purchase cost.
      select: { id: true, sku: true, type: true, name: true, categoryId: true, category: { select: { id: true, name: true } }, size: true, brand: true, tireType: true, rimType: true, condition: true, sellingPrice: true, priceMin: true, priceMax: true, minStock: true, maxStock: true, imageUrl: true, shortDescription: true, description: true, highlights: true, specifications: true, applications: true, slug: true, aliases: true, seo: true, tags: true, createdAt: true, stocks: { select: { quantity: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findFirst({
      where: { status: 'PUBLISHED', OR: [{ id }, { slug: id }, { aliases: { has: id } }] },
      select: {
        id: true, sku: true, type: true, name: true, size: true, brand: true, tireType: true, rimType: true, condition: true, sellingPrice: true, priceMin: true, priceMax: true, minStock: true, maxStock: true, imageUrl: true, shortDescription: true, description: true, highlights: true, specifications: true, applications: true, slug: true, aliases: true, seo: true, tags: true, createdAt: true,
        stocks: { select: { quantity: true } },
        productComments: {
          include: { user: { select: { id: true, email: true } } },
        },
        favouriteProducts: true,
      },
    });
  }

  async featuredReviews() {
    const comments = await this.prisma.productComment.findMany({
      where: { rating: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        product: { select: { id: true, name: true } },
        user: { select: { email: true } },
      },
    });
    return comments.map(({ user, ...comment }) => ({
      ...comment,
      reviewerName: `Khách hàng ${user.email.slice(0, 1).toUpperCase()}.`,
    }));
  }

  async findOneAdmin(id: string) { return this.prisma.product.findUnique({ where: { id } }); }

  private validatePriceRange(input: any) {
    const hasMin = input.priceMin != null;
    const hasMax = input.priceMax != null;
    if (hasMin !== hasMax) throw new BadRequestException('Giá tối thiểu và tối đa phải được nhập cùng nhau.');
    if (hasMin && (!Number.isFinite(input.priceMin) || !Number.isFinite(input.priceMax) ||
      input.priceMin <= 0 || input.priceMax < input.priceMin)) {
      throw new BadRequestException('Khoảng giá không hợp lệ: giá tối thiểu phải lớn hơn 0 và không lớn hơn giá tối đa.');
    }
  }

  async create(data: any) {
    this.validatePriceRange(data);
    // Quote ranges are never fixed checkout prices.
    if (data.priceMin != null) data = { ...data, sellingPrice: null };
    return saveContent(this.prisma, 'product', data);
  }

  async update(id: string, data: any) {
    if ('priceMin' in data || 'priceMax' in data) {
      // Explicit Admin range update must carry both bounds; no silent mixing with legacy fixed price.
      if (!('priceMin' in data) || !('priceMax' in data)) {
        throw new BadRequestException('Cần gửi đủ giá tối thiểu và tối đa.');
      }
      this.validatePriceRange(data);
      if (data.priceMin != null) data = { ...data, sellingPrice: null };
    }
    // An explicitly updated selling price is the operator's approval to replace
    // the external reference amount and allow checkout again.
    if (Object.prototype.hasOwnProperty.call(data, 'sellingPrice')) {
      const current = await this.prisma.product.findUnique({
        where: { id }, select: { sellingPrice: true, tags: true },
      });
      if (current?.tags.includes('PRICE_REFERENCE_2026') &&
          typeof data.sellingPrice === 'number' && Number.isFinite(data.sellingPrice) &&
          data.sellingPrice > 0 && data.sellingPrice !== current.sellingPrice) {
        data = { ...data, tags: (data.tags ?? current.tags).filter((tag: string) => tag !== 'PRICE_REFERENCE_2026') };
      }
    }
    return saveContent(this.prisma, 'product', data, id);
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async addComment(productId: string, userId: string, content: string, rating?: number) {
  return (this.prisma as any).productComment.create({ data: { productId, userId, content, rating } });
  }

  async toggleFavourite(productId: string, userId: string) {
    const existing = await (this.prisma as any).favouriteProduct.findUnique({ where: { productId_userId: { productId, userId } } });
    if (existing) {
      await (this.prisma as any).favouriteProduct.delete({ where: { id: existing.id } });
      return { removed: true };
    }
    const fav = await (this.prisma as any).favouriteProduct.create({ data: { productId, userId } });
    return { added: true, id: fav.id };
  }
}
