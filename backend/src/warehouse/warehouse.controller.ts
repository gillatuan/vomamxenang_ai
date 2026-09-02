import { Controller, Get, Post, Body, UseGuards, Delete, Param, Patch } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post()
  createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(createWarehouseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Patch(':id')
  updateWarehouse(@Param('id') id: string, @Body() data: UpdateWarehouseDto) { return this.warehouseService.updateWarehouse(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Delete(':id')
  deleteWarehouse(@Param('id') id: string) { return this.warehouseService.deleteWarehouse(id); }

  @UseGuards(JwtAuthGuard)
  @Get('map')
  getWarehouseMap() {
    return this.warehouseService.getWarehouseMap();
  }

  @UseGuards(JwtAuthGuard)
  @Post('scan')
  scanWarehouse(@Body('query') query: string) {
    return this.warehouseService.scanWarehouse(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post('locations')
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.warehouseService.createLocation(createLocationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Patch('locations/:id')
  updateLocation(@Param('id') id: string, @Body() data: UpdateLocationDto) { return this.warehouseService.updateLocation(id, data); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Delete('locations/:id')
  deleteLocation(@Param('id') id: string) { return this.warehouseService.deleteLocation(id); }

  @UseGuards(JwtAuthGuard)
  @Get('locations')
  findAllLocations() {
    return this.warehouseService.findAllLocations();
  }
}
