import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateZoneDto } from './dto/create-zone.dto';
import { CreateRackDto } from './dto/create-rack.dto';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  // ========== WAREHOUSE ==========
  async createWarehouse(createWarehouseDto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: createWarehouseDto,
    });
  }

  async findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        zones: {
          include: {
            racks: {
              include: {
                slots: {
                  include: {
                    stocks: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findWarehouseById(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            racks: {
              include: {
                slots: {
                  include: {
                    stocks: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getWarehouseStructure(warehouseId: string) {
    return this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
      include: {
        zones: {
          include: {
            racks: {
              include: {
                slots: {
                  include: {
                    stocks: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // ========== ZONE ==========
  async createZone(createZoneDto: CreateZoneDto) {
    return this.prisma.zone.create({
      data: createZoneDto,
      include: {
        warehouse: true
      },
    });
  }

  async findAllZones(warehouseId?: string) {
    return this.prisma.zone.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      include: {
        warehouse: true,
        racks: {
          include: {
            slots: true,
          },
        },
      },
    });
  }

  async findZoneById(id: string) {
    return this.prisma.zone.findUnique({
      where: { id },
      include: {
        warehouse: true,
        racks: {
          include: {
            slots: {
              include: {
                stocks: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // ========== RACK ==========
  async createRack(createRackDto: CreateRackDto) {
    return this.prisma.rack.create({
      data: createRackDto,
      include: {
        zone: true,
      },
    });
  }

  async findAllRacks(zoneId?: string) {
    return this.prisma.rack.findMany({
      where: zoneId ? { zoneId } : undefined,
      include: {
        zone: true,
        slots: true,
      },
    });
  }

  async findRackById(id: string) {
    return this.prisma.rack.findUnique({
      where: { id },
      include: {
        zone: true,
        slots: {
          include: {
            stocks: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  // ========== SLOT ==========
  async createSlot(createSlotDto: CreateSlotDto) {
    return this.prisma.slot.create({
      data: createSlotDto,
      include: {
        rack: true,
      },
    });
  }

  async findAllSlots(rackId?: string) {
    return this.prisma.slot.findMany({
      where: rackId ? { rackId } : undefined,
      include: {
        rack: true,
        stocks: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findSlotById(id: string) {
    return this.prisma.slot.findUnique({
      where: { id },
      include: {
        rack: {
          include: {
            zone: {
              include: {
                warehouse: true,
              },
            },
          },
        },
        stocks: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findSlotByBarcode(barcode: string) {
    return this.prisma.slot.findUnique({
      where: { barcode },
      include: {
        rack: {
          include: {
            zone: {
              include: {
                warehouse: true,
              },
            },
          },
        },
        stocks: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async getLocationCode(slotId: string): Promise<string | null> {
    const slot = await this.prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        rack: {
          include: {
            zone: {
              include: {
                warehouse: true,
              },
            },
          },
        },
      },
    });

    if (!slot) return null;

    return `${slot.rack.zone.warehouse.code}-${slot.rack.zone.code}-${slot.rack.code}-${slot.code}`;
  }
}
