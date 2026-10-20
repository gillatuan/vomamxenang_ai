import { Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';

// The production database may still lack columns introduced by
// 20261005090000_store_info_local_seo. Read only existing columns until that
// migration is safely applied; never silently discard user-supplied geo data.
const legacySelect = {
  id: true, name: true, address: true, phone: true, email: true,
  website: true, taxCode: true, logoUrl: true, facebookUrl: true,
  businessHours: true, notes: true, isActive: true,
  createdAt: true, updatedAt: true,
} satisfies Prisma.StoreInfoSelect;

const publicSelect = {
  id: true, name: true, address: true, phone: true, email: true,
  website: true, logoUrl: true, facebookUrl: true,
  googleMapsUrl: true, latitude: true, longitude: true,
  businessHours: true, notes: true, createdAt: true, updatedAt: true,
} satisfies Prisma.StoreInfoSelect;

const legacyPublicSelect = {
  id: true, name: true, address: true, phone: true, email: true,
  website: true, logoUrl: true, facebookUrl: true,
  businessHours: true, notes: true, createdAt: true, updatedAt: true,
} satisfies Prisma.StoreInfoSelect;

function missingStoreColumn(error: unknown): boolean {
  return typeof error === 'object' && error !== null &&
    'code' in error && error.code === 'P2022';
}

function requiresGeoColumns(data: CreateStoreInfoDto | UpdateStoreInfoDto): boolean {
  return data.googleMapsUrl != null || data.latitude != null || data.longitude != null;
}

@Injectable()
export class StoreInfoService {
  private readonly logger = new Logger(StoreInfoService.name);
  constructor(private prisma: PrismaService) {}

  private failGeoSave(): never {
    throw new ServiceUnavailableException(
      'Database chưa có cột Google Maps/toạ độ. Vui lòng áp dụng migration 20261005090000_store_info_local_seo trước khi lưu các trường này.',
    );
  }

  async create(data: CreateStoreInfoDto) {
    try {
      return await this.prisma.$transaction(async tx => {
        if (data.isActive !== false) {
          await tx.storeInfo.updateMany({ where: { isActive: true }, data: { isActive: false } });
        }
        if (requiresGeoColumns(data)) {
          const found = await tx.$queryRaw<Array<{ column_name: string }>>`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'StoreInfo'
              AND column_name IN ('googleMapsUrl', 'latitude', 'longitude')
          `;
          const names = new Set(found.map(row => row.column_name));
          if (!['googleMapsUrl', 'latitude', 'longitude'].every(name => names.has(name))) this.failGeoSave();
        }
        return tx.storeInfo.create({
          data: { ...data, isActive: data.isActive !== false },
          select: legacySelect,
        });
      });
    } catch (error) { this.handleError(error); }
  }

  async findAll() {
    try {
      return await this.prisma.storeInfo.findMany({ orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }] });
    } catch (error) {
      if (missingStoreColumn(error)) {
        return this.prisma.storeInfo.findMany({
          orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
          select: legacySelect,
        });
      }
      this.handleError(error);
    }
  }

  async findPublic() {
    try {
      return await this.prisma.storeInfo.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        select: publicSelect,
      });
    } catch (error) {
      if (missingStoreColumn(error)) {
        return this.prisma.storeInfo.findFirst({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
          select: legacyPublicSelect,
        });
      }
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    let store;
    try {
      store = await this.prisma.storeInfo.findUnique({ where: { id } });
    } catch (error) {
      if (!missingStoreColumn(error)) this.handleError(error);
      store = await this.prisma.storeInfo.findUnique({ where: { id }, select: legacySelect });
    }
    if (!store) throw new NotFoundException('Không tìm thấy cửa hàng.');
    return store;
  }

  async update(id: string, data: UpdateStoreInfoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.$transaction(async tx => {
        if (data.isActive === true) {
          await tx.storeInfo.updateMany({
            where: { isActive: true, id: { not: id } },
            data: { isActive: false },
          });
        }
        if (requiresGeoColumns(data)) {
          const found = await tx.$queryRaw<Array<{ column_name: string }>>`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'StoreInfo'
              AND column_name IN ('googleMapsUrl', 'latitude', 'longitude')
          `;
          const names = new Set(found.map(row => row.column_name));
          if (!['googleMapsUrl', 'latitude', 'longitude'].every(name => names.has(name))) this.failGeoSave();
        }
        return tx.storeInfo.update({ where: { id }, data, select: legacySelect });
      });
    } catch (error) { this.handleError(error); }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.storeInfo.delete({ where: { id }, select: legacySelect });
    } catch (error) { this.handleError(error); }
  }

  private handleError(error: unknown): never {
    if (error instanceof NotFoundException || error instanceof ServiceUnavailableException) throw error;
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code) : 'unknown';
    this.logger.error('StoreInfo persistence failed (Prisma code: ' + code + ')');
    if (code === 'P2021' || code === 'P2022') {
      throw new ServiceUnavailableException(
        'Database chưa đồng bộ StoreInfo; vui lòng kiểm tra Prisma migrations trên production.',
      );
    }
    throw error;
  }
}
