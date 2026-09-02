import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async createWarehouse(createWarehouseDto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: createWarehouseDto,
    });
  }

  updateWarehouse(id: string, data: UpdateWarehouseDto) {
    return this.prisma.warehouse.update({ where: { id }, data });
  }

  async deleteWarehouse(id: string) {
    const locations = await this.prisma.location.count({ where: { warehouseId: id } });
    if (locations) throw new BadRequestException('Remove or move all warehouse locations before deleting this warehouse');
    return this.prisma.warehouse.delete({ where: { id } });
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

  async updateLocation(id: string, data: UpdateLocationDto) {
    if (data.warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
      if (!warehouse) throw new BadRequestException('Warehouse not found');
    }
    return this.prisma.location.update({ where: { id }, data });
  }

  async deleteLocation(id: string) {
    const [stocks, transactions, orders] = await Promise.all([
      this.prisma.stockLocation.count({ where: { locationId: id } }),
      this.prisma.transactionDetail.count({ where: { locationId: id } }),
      this.prisma.orderItem.count({ where: { locationId: id } }),
    ]);
    if (stocks || transactions || orders) throw new BadRequestException('This location has stock or transaction history and cannot be deleted');
    return this.prisma.location.delete({ where: { id } });
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
