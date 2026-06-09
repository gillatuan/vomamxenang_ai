import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(condition?: string) {
    const where = condition ? { condition } : undefined;
    return this.prisma.product.findMany({ 
      where,
      orderBy: { createdAt: 'desc' } 
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
