import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CheckoutItemDto { @IsOptional() @IsString() productId?:string; @IsOptional() @IsString() wheelRimId?:string; @IsString() locationId!:string; @IsInt() @Min(1) quantity!:number; }
class CheckoutDto { @IsArray() @ValidateNested({each:true}) @Type(()=>CheckoutItemDto) items!:CheckoutItemDto[]; @IsOptional() @IsString() clientId?:string; @IsOptional() @IsIn(['RETAIL','B2B_TIER1','B2B_TIER2']) customerType?:'RETAIL'|'B2B_TIER1'|'B2B_TIER2'; }

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
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) { return this.service.updateStatus(id, dto.status); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Delete(':id')
  deleteDraft(@Param('id') id: string) { return this.service.deleteDraft(id); }

  @Post('checkout-session')
  async checkoutSession(@Body() body: CheckoutDto, @Req() req: AuthenticatedRequest) {
    return this.service.createCheckoutSession(body, req);
  }
}
