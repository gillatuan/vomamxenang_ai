import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        stocks: {
          include: {
            location: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            location: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        stocks: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Get total stock for a category across all locations
  async getTotalStock(categoryId: string) {
    const stocks = await this.prisma.stock.findMany({
      where: { categoryId },
    });

    const total = stocks.reduce<number>((sum, stock) => sum + stock.quantity, 0);
    return {
      categoryId,
      total,
      locations: stocks,
    };
  }

  // Search category by tire specifications
  async searchBySpecifications(query: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [
          { tireSize: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}
