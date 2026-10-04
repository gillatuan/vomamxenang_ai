import { saveContent } from '../content/content-alias';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(condition?: string, categoryId?: string) {
    const where = { status: 'PUBLISHED' as const, ...(condition ? { condition } : {}), ...(categoryId ? { categoryId } : {}) };
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // Public catalog responses must never disclose purchase cost.
      select: { id: true, sku: true, type: true, name: true, categoryId: true, category: { select: { id: true, name: true, tireSize: true, brand: true, tireType: true, rimType: true, condition: true } }, size: true, brand: true, tireType: true, rimType: true, condition: true, sellingPrice: true, minStock: true, maxStock: true, imageUrl: true, shortDescription: true, description: true, highlights: true, specifications: true, applications: true, slug: true, aliases: true, seo: true, tags: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findFirst({
      where: { status: 'PUBLISHED', OR: [{ id }, { slug: id }, { aliases: { has: id } }] },
      select: {
        id: true, sku: true, type: true, name: true, categoryId: true, category: { select: { id: true, name: true, tireSize: true, brand: true, tireType: true, rimType: true, condition: true } }, size: true, brand: true, tireType: true, rimType: true, condition: true, sellingPrice: true, minStock: true, maxStock: true, imageUrl: true, shortDescription: true, description: true, highlights: true, specifications: true, applications: true, slug: true, aliases: true, seo: true, tags: true, createdAt: true,
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

  async create(data: any) {
    return saveContent(this.prisma, 'product', data);
  }

  async update(id: string, data: any) {
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
