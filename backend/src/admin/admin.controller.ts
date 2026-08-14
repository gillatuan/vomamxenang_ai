import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get('dashboard/summary')
  async summary(@Req() req: { user: { role: string } }) {
    return this.dashboard.summary(req.user.role === 'ADMIN_MANAGER');
  }

  @Get('dashboard/low-stock')
  async lowStock() {
    return this.dashboard.inventoryAlerts();
  }

  @Roles('ADMIN_MANAGER')
  @Get('dashboard/order-status')
  async orderStatus() {
    return this.dashboard.orderStatus();
  }

  @Get('dashboard/inventory-movement')
  async inventoryMovement(@Query('range') range = '30d') {
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '12m': 365 }[range] ?? 30;
    return this.dashboard.inventoryMovement(days);
  }

  @Roles('ADMIN_MANAGER')
  @Get('dashboard-stats')
  async stats() {
    return this.dashboard.summary(true);
  }

  @Roles('ADMIN_MANAGER')
  @Get('inventory-alerts')
  async inventoryAlerts() {
    return this.dashboard.inventoryAlerts();
  }
}
