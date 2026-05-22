import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto, CreateReceiptItemDto } from './dto/create-receipt.dto';
import { CreateIssueDto, CreateIssueItemDto } from './dto/create-issue.dto';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';
import { ConfirmIssueDto } from './dto/confirm-issue.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ========== RECEIPT (PHIẾU NHẬP) ==========

  async createReceipt(createReceiptDto: CreateReceiptDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createReceiptDto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Generate receipt code
    const receiptCode = `RCPT-${Date.now()}`;

    const receipt = await this.prisma.receipt.create({
      data: {
        code: receiptCode,
        supplierId: createReceiptDto.supplierId,
        notes: createReceiptDto.notes,
        items: {
          create: createReceiptDto.items.map((item) => ({
            categoryId: item.categoryId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            slotId: item.slotId,
            notes: item.notes,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            category: true,
          },
        },
      },
    });

    return receipt;
  }

  async findAllReceipts() {
    return this.prisma.receipt.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findReceiptById(id: string) {
    return this.prisma.receipt.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async confirmReceipt(id: string, confirmReceiptDto: ConfirmReceiptDto) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException('Receipt is not in DRAFT status');
    }

    // Update receipt status and process items
    const updatedReceipt = await this.prisma.receipt.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Add inventory logs and update stocks
    for (const item of receipt.items) {
      // Find or create slot if not specified
      let slotId = item.slotId;
      
      if (!slotId) {
        // Find first available slot (implementation may vary)
        const firstSlot = await this.prisma.slot.findFirst();
        if (!firstSlot) {
          throw new BadRequestException('No slot available in warehouse');
        }
        slotId = firstSlot.id;
      }

      // Update or create stock
      const existingStock = await this.prisma.stock.findUnique({
        where: {
          categoryId_slotId: {
            categoryId: item.categoryId,
            slotId,
          },
        },
      });

      if (existingStock) {
        await this.prisma.stock.update({
          where: {
            categoryId_slotId: {
              categoryId: item.categoryId,
              slotId,
            },
          },
          data: {
            quantity: existingStock.quantity + item.quantity,
          },
        });
      } else {
        await this.prisma.stock.create({
          data: {
            categoryId: item.categoryId,
            slotId,
            quantity: item.quantity,
          },
        });
      }

      // Log inventory transaction
      await this.prisma.inventoryLog.create({
        data: {
          logType: 'RECEIPT',
          categoryId: item.categoryId,
          slotId,
          quantity: item.quantity,
          receiptId: id,
          notes: item.notes,
        },
      });
    }

    return this.findReceiptById(id);
  }

  // ========== ISSUE (PHIẾU XUẤT) ==========

  async createIssue(createIssueDto: CreateIssueDto) {
    // Generate issue code
    const issueCode = `ISS-${Date.now()}`;

    const issue = await this.prisma.issue.create({
      data: {
        code: issueCode,
        clientId: createIssueDto.clientId,
        reason: createIssueDto.reason,
        notes: createIssueDto.notes,
        items: {
          create: createIssueDto.items.map((item) => ({
            categoryId: item.categoryId,
            quantity: item.quantity,
            slotId: item.slotId,
            notes: item.notes,
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            category: true,
          },
        },
      },
    });

    return issue;
  }

  async findAllIssues() {
    return this.prisma.issue.findMany({
      include: {
        client: true,
        items: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findIssueById(id: string) {
    return this.prisma.issue.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async confirmIssue(id: string, confirmIssueDto: ConfirmIssueDto) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    if (issue.status !== 'DRAFT') {
      throw new BadRequestException('Issue is not in DRAFT status');
    }

    // Update issue status and process items
    const updatedIssue = await this.prisma.issue.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Reduce inventory and create logs
    for (const item of issue.items) {
      // Find stock by category and slot
      let slotId = item.slotId;

      if (!slotId) {
        // Find slot with available stock
        const stockWithSlot = await this.prisma.stock.findFirst({
          where: { categoryId: item.categoryId, quantity: { gt: 0 } },
        });
        if (!stockWithSlot) {
          throw new BadRequestException(
            `Insufficient stock for category ${item.categoryId}`,
          );
        }
        slotId = stockWithSlot.slotId;
      }

      // Check stock availability
      const stock = await this.prisma.stock.findUnique({
        where: {
          categoryId_slotId: {
            categoryId: item.categoryId,
            slotId,
          },
        },
      });

      if (!stock || stock.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for category ${item.categoryId} at slot ${slotId}`,
        );
      }

      // Update stock (reduce quantity)
      await this.prisma.stock.update({
        where: {
          categoryId_slotId: {
            categoryId: item.categoryId,
            slotId,
          },
        },
        data: {
          quantity: stock.quantity - item.quantity,
        },
      });

      // Log inventory transaction
      await this.prisma.inventoryLog.create({
        data: {
          logType: 'ISSUE',
          categoryId: item.categoryId,
          slotId,
          quantity: -item.quantity,
          issueId: id,
          notes: item.notes,
        },
      });
    }

    return this.findIssueById(id);
  }

  // ========== INVENTORY LOG ==========

  async findAllInventoryLogs() {
    return this.prisma.inventoryLog.findMany({
      include: {
        receipt: true,
        issue: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInventoryLogByCategory(categoryId: string) {
    return this.prisma.inventoryLog.findMany({
      where: { categoryId },
      include: {
        receipt: true,
        issue: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInventoryLogBySlot(slotId: string) {
    return this.prisma.inventoryLog.findMany({
      where: { slotId },
      include: {
        receipt: true,
        issue: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ========== STOCK SUMMARY ==========

  async getStockSummary() {
    const stocks = await this.prisma.stock.findMany({
      include: {
        category: true,
        slot: {
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
        },
      },
    });

    return stocks;
  }

  async getStockByCategory(categoryId: string) {
    return this.prisma.stock.findMany({
      where: { categoryId },
      include: {
        category: true,
        slot: {
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
        },
      },
    });
  }

  async getStockBySlot(slotId: string) {
    return this.prisma.stock.findMany({
      where: { slotId },
      include: {
        category: true,
        slot: {
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
        },
      },
    });
  }
}
