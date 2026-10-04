import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProductResearchService } from './product-research.service';

@Controller('admin/product-research')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MANAGER')
export class ProductResearchController {
  constructor(private service: ProductResearchService) {}
  @Get('product/:productId') list(@Param('productId') productId:string){ return this.service.list(productId); }
  @Post('product/:productId') create(@Param('productId') productId:string,@Body() body:any){ return this.service.create(productId,body); }
  @Post(':id/review') review(@Param('id') id:string,@Body() body:{action:'APPROVE'|'REJECT'},@Req() req:any){ return this.service.review(id,body.action,req.user.sub); }
  @Post(':id/apply') apply(@Param('id') id:string,@Req() req:any){ return this.service.apply(id,req.user.sub); }
}
