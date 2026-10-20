import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';

@Injectable()
export class StoreInfoService {
  private readonly logger = new Logger(StoreInfoService.name);
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStoreInfoDto) {
    try {
      return await this.prisma.$transaction(async tx => {
        if (data.isActive !== false) {
          await tx.storeInfo.updateMany({ where: { isActive: true }, data: { isActive: false } });
        }
        return tx.storeInfo.create({ data: { ...data, isActive: data.isActive !== false } });
      });
    } catch (error) { this.handleError(error); }
  }

  async findAll() {
    try { return await this.prisma.storeInfo.findMany({ orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }] }); }
    catch (error) { this.handleError(error); }
  }

  async findPublic() {
    try {
      return await this.prisma.storeInfo.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, name: true, address: true, phone: true, email: true, website: true,
          logoUrl: true, facebookUrl: true, googleMapsUrl: true,
          latitude: true, longitude: true, businessHours: true,
          notes: true, createdAt: true, updatedAt: true,
        },
      });
    } catch (error) { this.handleError(error); }
  }

  async findOne(id: string) {
    try {
      const store = await this.prisma.storeInfo.findUnique({ where: { id } });
      if (!store) throw new NotFoundException('Không tìm thấy cửa hàng.');
      return store;
    } catch (error) { this.handleError(error); }
  }

  async update(id: string, data: UpdateStoreInfoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.$transaction(async tx => {
        if (data.isActive === true) {
          await tx.storeInfo.updateMany({ where: { isActive: true, id: { not: id } }, data: { isActive: false } });
        }
        return tx.storeInfo.update({ where: { id }, data });
      });
    } catch (error) { this.handleError(error); }
  }

  async remove(id: string) {
    await this.findOne(id);
    try { return await this.prisma.storeInfo.delete({ where: { id } }); }
    catch (error) { this.handleError(error); }
  }

  private handleError(error: unknown): never {
    if (error instanceof NotFoundException) throw error;
    const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : 'unknown';
    this.logger.error('StoreInfo persistence failed (Prisma code: ' + code + ')');
    if (code === 'P2021' || code === 'P2022') {
      throw new ServiceUnavailableException('Database chưa đồng bộ StoreInfo; cần áp dụng Prisma migrations trên môi trường này.');
    }
    throw error;
  }
}
