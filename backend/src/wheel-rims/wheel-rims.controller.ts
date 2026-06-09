import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WheelRimsService } from './wheel-rims.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('wheel-rims')
export class WheelRimsController {
  constructor(private service: WheelRimsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
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
