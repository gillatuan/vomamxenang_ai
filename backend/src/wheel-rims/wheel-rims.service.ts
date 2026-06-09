import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WheelRimsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.wheelRim.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
  }

  async findOne(id: string) {
    return this.prisma.wheelRim.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.wheelRim.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.wheelRim.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.wheelRim.delete({ where: { id } });
  }
}
