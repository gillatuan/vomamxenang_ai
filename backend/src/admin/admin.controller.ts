import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminManagementService } from './admin-management.service';
import { UpdatePriceMatrixDto } from './dto/update-price-matrix.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly dashboard: AdminDashboardService, private readonly management: AdminManagementService) {}

  @Get('management/products')
  products() { return this.management.products(); }

  @Get('management/wheel-rims')
  wheelRims() { return this.management.wheelRims(); }

  @Get('management/warehouses')
  warehouses() { return this.management.warehouses(); }

  @Roles('ADMIN_MANAGER')
  @Get('management/price-matrix')
  priceMatrix() { return this.management.priceMatrix(); }

  @Roles('ADMIN_MANAGER')
  @Post('management/price-matrix')
  upsertPriceMatrix(@Body() dto: UpdatePriceMatrixDto) { return this.management.upsertPriceMatrix(dto.productId, dto.customerType, dto.price); }

  @Roles('ADMIN_MANAGER')
  @Get('management/users')
  users() { return this.management.users(); }

  @Roles('ADMIN_MANAGER')
  @Get('management/product-comments')
  productComments() { return this.management.productComments(); }

  @Roles('ADMIN_MANAGER')
  @Get('management/post-comments')
  postComments() { return this.management.postComments(); }

  @Roles('ADMIN_MANAGER')
  @Get('management/favourites')
  favourites() { return this.management.favourites(); }

  @Roles('ADMIN_MANAGER')
  @Get('reports')
  reports() { return this.management.reports(); }

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
