import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async createWarehouse(createWarehouseDto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: createWarehouseDto,
    });
  }

  async createLocation(createLocationDto: CreateLocationDto) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: createLocationDto.warehouseId } });
    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }

    const locationCode = createLocationDto.locationCode || `${warehouse.code}-${createLocationDto.zone}-${createLocationDto.rack}-${createLocationDto.slot}`;

    return this.prisma.location.create({
      data: {
        warehouseId: createLocationDto.warehouseId,
        zone: createLocationDto.zone,
        rack: createLocationDto.rack,
        slot: createLocationDto.slot,
        locationCode,
        capacity: createLocationDto.capacity ?? 50,
      },
    });
  }

  async findAllLocations() {
    return this.prisma.location.findMany({
      include: {
        warehouse: true,
        stocks: {
          include: {
            product: true,
            wheelRim: true,
          },
        },
      },
    });
  }

  async getWarehouseMap() {
    return this.prisma.warehouse.findMany({
      include: {
        locations: {
          include: {
            stocks: {
              include: {
                product: true,
                wheelRim: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async scanWarehouse(query: string) {
    const normalized = query?.replace(/^SKU:/i, '').trim();
    if (!normalized) {
      throw new BadRequestException('Invalid scan query');
    }

    return this.prisma.stockLocation.findMany({
      where: {
        OR: [
          { product: { sku: normalized } },
          { wheelRim: { sku: normalized } },
          { location: { locationCode: normalized } },
        ],
      },
      include: {
        location: true,
        product: true,
        wheelRim: true,
      },
    });
  }
}
