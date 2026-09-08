import { NotFoundException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(private service: PostsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Get('admin/all')
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    if (!item) throw new NotFoundException('Không tìm thấy nội dung.');
    return item;
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
