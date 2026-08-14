import { Injectable } from '@nestjs/common';
import { OrderStatus, ProductType, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL' | 'OVERSTOCK';

export interface InventoryAlert {
  productId: string;
  sku: string;
  name: string;
  type: ProductType;
  brand: string | null;
  size: string | null;
  currentQuantity: number;
  minStock: number;
  maxStock: number;
  status: StockStatus;
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private stockStatus(quantity: number, minStock: number, maxStock: number): StockStatus {
    if (quantity === 0) return 'OUT_OF_STOCK';
    if (quantity < minStock) return 'LOW_STOCK';
    if (quantity > maxStock) return 'OVERSTOCK';
    return 'NORMAL';
  }

  async inventoryAlerts(): Promise<InventoryAlert[]> {
    const products = await this.prisma.product.findMany({
      select: {
        id: true, sku: true, name: true, type: true, brand: true, size: true,
        minStock: true, maxStock: true, stocks: { select: { quantity: true } },
      },
    });

    const priority: Record<StockStatus, number> = {
      OUT_OF_STOCK: 0, LOW_STOCK: 1, OVERSTOCK: 2, NORMAL: 3,
    };
    return products
      .map((product) => {
        const currentQuantity = product.stocks.reduce((total, stock) => total + stock.quantity, 0);
        return {
          productId: product.id, sku: product.sku, name: product.name, type: product.type,
          brand: product.brand, size: product.size, currentQuantity,
          minStock: product.minStock, maxStock: product.maxStock,
          status: this.stockStatus(currentQuantity, product.minStock, product.maxStock),
        };
      })
      .sort((left, right) => priority[left.status] - priority[right.status]);
  }

  async summary(includeBusiness: boolean) {
    const [products, wheelRims, warehouses, alerts, posts, productComments, postComments, favourites] = await Promise.all([
      this.prisma.product.findMany({ select: { type: true, stocks: { select: { quantity: true } } } }),
      this.prisma.wheelRim.findMany({ select: { stocks: { select: { quantity: true } } } }),
      this.prisma.warehouse.findMany({ select: { locations: { select: { capacity: true, stocks: { select: { quantity: true } } } } } }),
      this.inventoryAlerts(),
      this.prisma.post.count(), this.prisma.productComment.count(), this.prisma.postComment.count(), this.prisma.favouriteProduct.count(),
    ]);

    const productQuantity = products.reduce((total, product) => total + product.stocks.reduce((sum, stock) => sum + stock.quantity, 0), 0);
    const wheelRimQuantity = wheelRims.reduce((total, rim) => total + rim.stocks.reduce((sum, stock) => sum + stock.quantity, 0), 0);
    const locations = warehouses.flatMap((warehouse) => warehouse.locations);
    const totalCapacity = locations.reduce((total, location) => total + location.capacity, 0);
    const usedCapacity = locations.reduce((total, location) => total + location.stocks.reduce((sum, stock) => sum + stock.quantity, 0), 0);

    const result: {
      inventory: Record<string, number>;
      warehouse: Record<string, number>;
      content: Record<string, number>;
      business?: Record<string, number>;
    } = {
      inventory: {
        products: products.length, tires: products.filter((product) => product.type === 'TIRE').length,
        wheelRims: wheelRims.length, quantity: productQuantity + wheelRimQuantity,
        lowStock: alerts.filter((item) => item.status === 'LOW_STOCK').length,
        outOfStock: alerts.filter((item) => item.status === 'OUT_OF_STOCK').length,
        overstock: alerts.filter((item) => item.status === 'OVERSTOCK').length,
      },
      warehouse: { warehouses: warehouses.length, locations: locations.length, totalCapacity, usedCapacity, utilizationRate: totalCapacity ? Math.round((usedCapacity / totalCapacity) * 10000) / 100 : 0 },
      content: { posts, productComments, postComments, favourites },
    };

    if (includeBusiness) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const month = new Date(now.getFullYear(), now.getMonth(), 1);
      const [clients, suppliers, orders, pendingOrders, paidOrders, todayRevenue, monthlyRevenue] = await Promise.all([
        this.prisma.client.count(), this.prisma.supplier.count(), this.prisma.order.count(),
        this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        this.prisma.order.count({ where: { status: OrderStatus.PAID } }),
        this.prisma.order.aggregate({ where: { status: OrderStatus.PAID, createdAt: { gte: today } }, _sum: { totalAmount: true } }),
        this.prisma.order.aggregate({ where: { status: OrderStatus.PAID, createdAt: { gte: month } }, _sum: { totalAmount: true } }),
      ]);
      result.business = { clients, suppliers, orders, pendingOrders, paidOrders, todayRevenue: todayRevenue._sum.totalAmount ?? 0, monthlyRevenue: monthlyRevenue._sum.totalAmount ?? 0 };
    }
    return result;
  }

  async orderStatus() {
    const counts = await this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } });
    const total = counts.reduce((sum, item) => sum + item._count._all, 0);
    return counts.map((item) => ({ status: item.status, count: item._count._all, percentage: total ? Math.round((item._count._all / total) * 10000) / 100 : 0 }));
  }

  async inventoryMovement(days: number) {
    const from = new Date();
    from.setDate(from.getDate() - days + 1);
    const details = await this.prisma.transactionDetail.findMany({
      where: { transaction: { createdAt: { gte: from } } },
      select: { quantity: true, transaction: { select: { type: true, createdAt: true } } },
    });
    const buckets = new Map<string, Record<TransactionType, number>>();
    for (const detail of details) {
      const key = detail.transaction.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(key) ?? { IMPORT: 0, EXPORT: 0, ASSEMBLY_OUT: 0, ASSEMBLY_IN: 0 };
      bucket[detail.transaction.type] += detail.quantity;
      buckets.set(key, bucket);
    }
    return [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([date, values]) => ({ date, imports: values.IMPORT, exports: values.EXPORT, assemblyOut: values.ASSEMBLY_OUT, assemblyIn: values.ASSEMBLY_IN }));
  }
}
