import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('receipts')
  createReceipt(@Body() createReceiptDto: CreateReceiptDto) {
    return this.inventoryService.createReceipt(createReceiptDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('receipts')
  findAllReceipts() {
    return this.inventoryService.findAllReceipts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('receipts/:id')
  findReceiptById(@Param('id') id: string) {
    return this.inventoryService.findReceiptById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('receipts/:id/confirm')
  confirmReceipt(@Param('id') id: string) {
    return this.inventoryService.confirmReceipt(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('issues')
  createIssue(@Body() createIssueDto: CreateIssueDto) {
    return this.inventoryService.createIssue(createIssueDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('issues')
  findAllIssues() {
    return this.inventoryService.findAllIssues();
  }

  @UseGuards(JwtAuthGuard)
  @Get('issues/:id')
  findIssueById(@Param('id') id: string) {
    return this.inventoryService.findIssueById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('issues/:id/confirm')
  confirmIssue(@Param('id') id: string) {
    return this.inventoryService.confirmIssue(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assembly')
  assembleInventory(@Req() req: any, @Body() body: any) {
    const { productId, wheelRimId, quantity, pressingFee, locationId } = body;
    const userId = body.userId || req.user?.sub;
    return this.inventoryService.assembleInventory(productId, wheelRimId, quantity, pressingFee, locationId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  findAllInventoryLogs() {
    return this.inventoryService.findAllInventoryLogs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs/product/:productId')
  getInventoryLogByProduct(@Param('productId') productId: string) {
    return this.inventoryService.getInventoryLogByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs/location/:locationId')
  getInventoryLogByLocation(@Param('locationId') locationId: string) {
    return this.inventoryService.getInventoryLogByLocation(locationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stocks/summary')
  getStockSummary() {
    return this.inventoryService.getStockSummary();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stocks/product/:productId')
  getStockByProduct(@Param('productId') productId: string) {
    return this.inventoryService.getStockByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stocks/location/:locationId')
  getStockByLocation(@Param('locationId') locationId: string) {
    return this.inventoryService.getStockByLocation(locationId);
  }
}
