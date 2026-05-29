import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Roles('ADMIN_MANAGER')
  @Get('dashboard-stats')
  async stats() {
    const totalClients = await this.prisma.client.count();
    const revenueResult = await this.prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: 'PAID' } });
    const paidOrders = await this.prisma.order.findMany({ where: { status: 'PAID' }, orderBy: { createdAt: 'asc' } });

    const months = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + index, 1);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      return { key: `${date.getFullYear()}-${date.getMonth() + 1}`, month: `${monthLabel} ${date.getFullYear()}`, revenue: 0 };
    });

    const revenueByMonth = paidOrders.reduce((acc: any, order: any) => {
      const monthLabel = order.createdAt.toLocaleString('default', { month: 'short' });
      const year = order.createdAt.getFullYear();
      const label = `${monthLabel} ${year}`;
      const existing = acc.find((entry: any) => entry.month === label);
      if (existing) existing.revenue += Number(order.totalAmount.toString());
      return acc;
    }, months);

    return { totalClients, totalRevenue: Number(revenueResult._sum.totalAmount?.toString() ?? '0'), revenueByMonth };
  }

  @Roles('ADMIN_MANAGER')
  @Get('inventory-alerts')
  async inventoryAlerts() {
    const products = await this.prisma.product.findMany({
      include: {
        stocks: true,
      },
    });

    const alerts = products
      .map((product) => {
        const quantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          minStock: product.minStock,
          currentQuantity: quantity,
          thresholdExceeded: quantity < product.minStock,
        };
      })
      .filter((item) => item.thresholdExceeded);

    return alerts;
  }
}
