import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { CreateIssueDto } from './dto/create-issue.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createReceipt(createReceiptDto: CreateReceiptDto, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createReceiptDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const transactionCode = `IMPORT-${Date.now()}`;
    return this.prisma.inventoryTransaction.create({
      data: {
        code: transactionCode,
        type: 'IMPORT',
        partnerName: supplier.name ?? supplier.company ?? supplier.email,
        userId,
        details: {
          create: createReceiptDto.items.map((item) => ({
            productId: item.productId,
            wheelRimId: item.wheelRimId,
            locationId: item.locationId ?? '',
            quantity: item.quantity,
            price: item.unitPrice,
          })),
        },
      },
      include: { details: true },
    });
  }

  async findAllReceipts() {
    return this.prisma.inventoryTransaction.findMany({
      where: { type: 'IMPORT' },
      include: { details: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReceiptById(id: string) {
    return this.prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { details: true },
    });
  }

  async confirmReceipt(id: string) {
    const transaction = await this.prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { details: true },
    });
    if (!transaction || transaction.type !== 'IMPORT') {
      throw new NotFoundException('Receipt transaction not found');
    }

    if (transaction.status === 'CONFIRMED') return transaction;
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.inventoryTransaction.updateMany({ where: { id, status: 'DRAFT' }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
      if (claimed.count !== 1) throw new BadRequestException('Receipt has already been confirmed');
      for (const detail of transaction.details) {
        if (!detail.locationId) {
          throw new BadRequestException('Receipt detail requires locationId');
        }

        const existingStock = await tx.stockLocation.findFirst({
          where: {
            locationId: detail.locationId,
            productId: detail.productId ?? undefined,
            wheelRimId: detail.wheelRimId ?? undefined,
          },
        });

        if (existingStock) {
          await tx.stockLocation.update({
            where: { id: existingStock.id },
            data: { quantity: { increment: detail.quantity } },
          });
        } else {
          await tx.stockLocation.create({
            data: {
              locationId: detail.locationId,
              productId: detail.productId,
              wheelRimId: detail.wheelRimId,
              quantity: detail.quantity,
            },
          });
        }
      }
    });

    return this.findReceiptById(id);
  }

  async createIssue(createIssueDto: CreateIssueDto, userId: string) {
    const client = createIssueDto.clientId
      ? await this.prisma.client.findUnique({ where: { id: createIssueDto.clientId } })
      : null;
    if (createIssueDto.clientId && !client) {
      throw new NotFoundException('Client not found');
    }
    const transactionCode = `EXPORT-${Date.now()}`;
    return this.prisma.inventoryTransaction.create({
      data: {
        code: transactionCode,
        type: 'EXPORT',
        partnerName: client?.name ?? 'Internal',
        userId,
        details: {
          create: createIssueDto.items.map((item) => ({
            productId: item.productId,
            wheelRimId: item.wheelRimId,
            locationId: item.locationId ?? '',
            quantity: item.quantity,
            price: 0,
          })),
        },
      },
      include: { details: true },
    });
  }

  async findAllIssues() {
    return this.prisma.inventoryTransaction.findMany({
      where: { type: 'EXPORT' },
      include: { details: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findIssueById(id: string) {
    return this.prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { details: true },
    });
  }

  async confirmIssue(id: string) {
    const transaction = await this.prisma.inventoryTransaction.findUnique({
      where: { id },
      include: { details: true },
    });
    if (!transaction || transaction.type !== 'EXPORT') {
      throw new NotFoundException('Issue transaction not found');
    }

    if (transaction.status === 'CONFIRMED') return transaction;
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.inventoryTransaction.updateMany({ where: { id, status: 'DRAFT' }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
      if (claimed.count !== 1) throw new BadRequestException('Issue has already been confirmed');
      const stockUpdates = new Map<string, number>();

      for (const detail of transaction.details) {
        if (!detail.locationId) {
          throw new BadRequestException('Issue detail requires locationId');
        }

        const stock = await tx.stockLocation.findFirst({
          where: {
            locationId: detail.locationId,
            productId: detail.productId ?? undefined,
            wheelRimId: detail.wheelRimId ?? undefined,
          },
        });

        if (!stock) {
          throw new BadRequestException('Insufficient stock for the chosen location');
        }

        stockUpdates.set(
          stock.id,
          (stockUpdates.get(stock.id) ?? 0) + detail.quantity,
        );
      }

      for (const [stockId, quantity] of stockUpdates) {
        const updated = await tx.stockLocation.updateMany({
          where: { id: stockId, quantity: { gte: quantity } },
          data: { quantity: { decrement: quantity } },
        });
        if (updated.count !== 1) {
          throw new BadRequestException('Insufficient stock for the chosen location');
        }
      }
    });

    return this.findIssueById(id);
  }

  async findAllInventoryLogs() {
    return this.prisma.transactionDetail.findMany({
      include: {
        transaction: true,
        product: true,
        wheelRim: true,
        location: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findAllAssemblyLogs() {
    return this.prisma.assemblyLog.findMany({
      include: { product: true, wheelRim: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInventoryLogByProduct(productId: string) {
    return this.prisma.transactionDetail.findMany({
      where: { productId },
      include: {
        transaction: true,
        location: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async getInventoryLogByLocation(locationId: string) {
    return this.prisma.transactionDetail.findMany({
      where: { locationId },
      include: {
        transaction: true,
        product: true,
        wheelRim: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async getStockSummary() {
    return this.prisma.stockLocation.findMany({
      include: {
        location: true,
        product: true,
        wheelRim: true,
      },
    });
  }

  async getStockByProduct(productId: string) {
    return this.prisma.stockLocation.findMany({
      where: { productId },
      include: {
        location: true,
      },
    });
  }

  async getStockByLocation(locationId: string) {
    return this.prisma.stockLocation.findMany({
      where: { locationId },
      include: {
        product: true,
        wheelRim: true,
      },
    });
  }

  async assembleInventory(productId: string, wheelRimId: string, quantity: number, pressingFee: number, locationId: string, userId: string) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const productStock = await this.prisma.stockLocation.findFirst({
      where: {
        locationId,
        productId,
      },
    });
    const wheelRimStock = await this.prisma.stockLocation.findFirst({
      where: {
        locationId,
        wheelRimId,
      },
    });

    if (!productStock || productStock.quantity < quantity) {
      throw new BadRequestException('Insufficient tire stock for assembly');
    }
    if (!wheelRimStock || wheelRimStock.quantity < quantity) {
      throw new BadRequestException('Insufficient wheel rim stock for assembly');
    }

    await this.prisma.$transaction([
      this.prisma.stockLocation.update({
        where: { id: productStock.id },
        data: { quantity: { decrement: quantity } },
      }),
      this.prisma.stockLocation.update({
        where: { id: wheelRimStock.id },
        data: { quantity: { decrement: quantity } },
      }),
      this.prisma.assemblyLog.create({
        data: {
          productId,
          wheelRimId,
          quantity,
          pressingFee,
          userId,
        },
      }),
    ]);

    return { message: 'Assembly completed', productId, wheelRimId, quantity };
  }
}
