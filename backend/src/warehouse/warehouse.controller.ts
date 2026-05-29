import { Controller, Get, Post, Body } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(createWarehouseDto);
  }

  @Get('map')
  getWarehouseMap() {
    return this.warehouseService.getWarehouseMap();
  }

  @Post('scan')
  scanWarehouse(@Body('query') query: string) {
    return this.warehouseService.scanWarehouse(query);
  }

  @Post('locations')
  createLocation(@Body() createLocationDto: CreateLocationDto) {
    return this.warehouseService.createLocation(createLocationDto);
  }

  @Get('locations')
  findAllLocations() {
    return this.warehouseService.findAllLocations();
  }
}
