import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { CreateZoneDto } from './dto/create-zone.dto';
import { CreateRackDto } from './dto/create-rack.dto';
import { CreateSlotDto } from './dto/create-slot.dto';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ========== WAREHOUSE ENDPOINTS ==========
  @Post()
  createWarehouse(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.createWarehouse(createWarehouseDto);
  }

  @Get()
  findAllWarehouses() {
    return this.warehouseService.findAllWarehouses();
  }

  @Get(':id')
  findWarehouseById(@Param('id') id: string) {
    return this.warehouseService.findWarehouseById(id);
  }

  @Get(':id/structure')
  getWarehouseStructure(@Param('id') id: string) {
    return this.warehouseService.getWarehouseStructure(id);
  }

  // ========== ZONE ENDPOINTS ==========
  @Post('zones')
  createZone(@Body() createZoneDto: CreateZoneDto) {
    return this.warehouseService.createZone(createZoneDto);
  }

  @Get('zones/list')
  findAllZones(@Query('warehouseId') warehouseId?: string) {
    return this.warehouseService.findAllZones(warehouseId);
  }

  @Get('zones/:id')
  findZoneById(@Param('id') id: string) {
    return this.warehouseService.findZoneById(id);
  }

  // ========== RACK ENDPOINTS ==========
  @Post('racks')
  createRack(@Body() createRackDto: CreateRackDto) {
    return this.warehouseService.createRack(createRackDto);
  }

  @Get('racks/list')
  findAllRacks(@Query('zoneId') zoneId?: string) {
    return this.warehouseService.findAllRacks(zoneId);
  }

  @Get('racks/:id')
  findRackById(@Param('id') id: string) {
    return this.warehouseService.findRackById(id);
  }

  // ========== SLOT ENDPOINTS ==========
  @Post('slots')
  createSlot(@Body() createSlotDto: CreateSlotDto) {
    return this.warehouseService.createSlot(createSlotDto);
  }

  @Get('slots/list')
  findAllSlots(@Query('rackId') rackId?: string) {
    return this.warehouseService.findAllSlots(rackId);
  }

  @Get('slots/:id')
  findSlotById(@Param('id') id: string) {
    return this.warehouseService.findSlotById(id);
  }

  @Get('slots/barcode/:barcode')
  findSlotByBarcode(@Param('barcode') barcode: string) {
    return this.warehouseService.findSlotByBarcode(barcode);
  }

  @Get('slots/:id/location-code')
  getLocationCode(@Param('id') id: string) {
    return this.warehouseService.getLocationCode(id);
  }
}
