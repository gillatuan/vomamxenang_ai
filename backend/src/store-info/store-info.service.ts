import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';

@Injectable()
export class StoreInfoService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateStoreInfoDto) { return this.prisma.storeInfo.create({ data }); }
  findAll() { return this.prisma.storeInfo.findMany({ orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }] }); }
  async findOne(id: string) { const store = await this.prisma.storeInfo.findUnique({ where: { id } }); if (!store) throw new NotFoundException('Không tìm thấy cửa hàng.'); return store; }
  async update(id: string, data: UpdateStoreInfoDto) { await this.findOne(id); return this.prisma.storeInfo.update({ where: { id }, data }); }
  async remove(id: string) { await this.findOne(id); return this.prisma.storeInfo.delete({ where: { id } }); }
}
