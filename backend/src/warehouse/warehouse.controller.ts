import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN_MANAGER')
  @Post()
  createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(createWarehouseDto);
  }

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

  @UseGuards(JwtAuthGuard)
  @Get('locations')
  findAllLocations() {
    return this.warehouseService.findAllLocations();
  }
}
