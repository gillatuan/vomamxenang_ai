import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(condition?: string) {
    const where = { status: 'PUBLISHED' as const, ...(condition ? { condition } : {}) };
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // Public catalog responses must never disclose purchase cost.
      select: { id: true, sku: true, type: true, name: true, size: true, brand: true, tireType: true, rimType: true, condition: true, sellingPrice: true, minStock: true, maxStock: true, imageUrl: true, description: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id, status: 'PUBLISHED' },
      select: {
        id: true, sku: true, type: true, name: true, size: true, brand: true, tireType: true, rimType: true, condition: true, sellingPrice: true, minStock: true, maxStock: true, imageUrl: true, description: true, createdAt: true,
        productComments: {
          include: { user: { select: { id: true, email: true } } },
        },
        favouriteProducts: true,
      },
    });
  }

  async findOneAdmin(id: string) { return this.prisma.product.findUnique({ where: { id } }); }

  async create(data: any) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
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
