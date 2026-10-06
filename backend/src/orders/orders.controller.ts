import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

class CheckoutItemDto {
  @IsOptional() @IsString() productId?: string;
  @IsOptional() @IsString() wheelRimId?: string;
  @IsString() locationId!: string;
  @IsInt() @Min(1) quantity!: number;
}
class PaymentDueDto {
  @IsOptional() @IsString() paymentDueDate?: string | null;
}
class RecordPaymentDto {
  @IsNumber() @Min(0.01) amount!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsOptional() @IsString() @MaxLength(120) reference?: string;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
  @IsOptional() @IsDateString() receivedAt?: string;
}
class CheckoutDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CheckoutItemDto) items!: CheckoutItemDto[];
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsIn(['RETAIL', 'B2B_TIER1', 'B2B_TIER2']) customerType?: 'RETAIL' | 'B2B_TIER1' | 'B2B_TIER2';
}

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post('webhook')
  stripeWebhook(@Req() req: Request & { rawBody?: Buffer }, @Headers('stripe-signature') signature?: string) {
    if (!req.rawBody || !signature) throw new BadRequestException('Missing Stripe webhook signature');
    return this.service.handleStripeWebhook(req.rawBody, signature);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post('reservations/release-expired')
  releaseExpiredReservations() { return this.service.releaseExpiredReservations(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Get('receivables')
  receivables() { return this.service.receivables(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Patch(':id/payment-due')
  updatePaymentDue(@Param('id') id: string, @Body() body: PaymentDueDto) { return this.service.updatePaymentDueDate(id, body.paymentDueDate ?? null); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post(':id/payments')
  recordPayment(@Param('id') id: string, @Body() body: RecordPaymentDto, @Req() req: AuthenticatedRequest) {
    return this.service.recordPayment(id, body, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post(':id/fulfillment')
  createFulfillment(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.createFulfillment(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Delete(':id')
  deleteDraft(@Param('id') id: string) { return this.service.deleteDraft(id); }

  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  async checkoutSession(@Body() body: CheckoutDto, @Req() req: AuthenticatedRequest) {
    return this.service.createCheckoutSession(body, req);
  }
}
