import { NotFoundException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  @Get()
  findAll(@Query('condition') condition?: string, @Query('categoryId') categoryId?: string) {
    return this.service.findAll(condition, categoryId);
  }

  @Get('reviews/featured')
  featuredReviews() {
    return this.service.featuredReviews();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    if (!item) throw new NotFoundException('Không tìm thấy nội dung.');
    return item;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  async addComment(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user?.sub || body.userId;
    return this.service.addComment(id, userId, body.content, body.rating);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favourite')
  async toggleFavourite(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const userId = req.user?.sub || body.userId;
    return this.service.toggleFavourite(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
