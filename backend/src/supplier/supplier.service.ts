import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      include: {
        receipts: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        receipts: {
          include: {
            items: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
