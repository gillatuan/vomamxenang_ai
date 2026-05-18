import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
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
}
