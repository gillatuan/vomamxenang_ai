import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Post('checkout-session')
  async checkoutSession(@Body() body: any, @Req() req: any) {
    return this.service.createCheckoutSession(body, req);
  }
}
