import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';
import { StoreInfoService } from './store-info.service';

@Controller('store-info') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
export class StoreInfoController {
  constructor(private service: StoreInfoService) {}
  @Post() create(@Body() data: CreateStoreInfoDto) { return this.service.create(data); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() data: UpdateStoreInfoDto) { return this.service.update(id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
