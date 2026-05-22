import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';
import { ConfirmIssueDto } from './dto/confirm-issue.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ========== RECEIPT ENDPOINTS ==========
  @Post('receipts')
  createReceipt(@Body() createReceiptDto: CreateReceiptDto) {
    return this.inventoryService.createReceipt(createReceiptDto);
  }

  @Get('receipts')
  findAllReceipts() {
    return this.inventoryService.findAllReceipts();
  }

  @Get('receipts/:id')
  findReceiptById(@Param('id') id: string) {
    return this.inventoryService.findReceiptById(id);
  }

  @Patch('receipts/:id/confirm')
  confirmReceipt(
    @Param('id') id: string,
    @Body() confirmReceiptDto: ConfirmReceiptDto,
  ) {
    return this.inventoryService.confirmReceipt(id, confirmReceiptDto);
  }

  // ========== ISSUE ENDPOINTS ==========
  @Post('issues')
  createIssue(@Body() createIssueDto: CreateIssueDto) {
    return this.inventoryService.createIssue(createIssueDto);
  }

  @Get('issues')
  findAllIssues() {
    return this.inventoryService.findAllIssues();
  }

  @Get('issues/:id')
  findIssueById(@Param('id') id: string) {
    return this.inventoryService.findIssueById(id);
  }

  @Patch('issues/:id/confirm')
  confirmIssue(
    @Param('id') id: string,
    @Body() confirmIssueDto: ConfirmIssueDto,
  ) {
    return this.inventoryService.confirmIssue(id, confirmIssueDto);
  }

  // ========== INVENTORY LOG ENDPOINTS ==========
  @Get('logs')
  findAllInventoryLogs() {
    return this.inventoryService.findAllInventoryLogs();
  }

  @Get('logs/category/:categoryId')
  getInventoryLogByCategory(@Param('categoryId') categoryId: string) {
    return this.inventoryService.getInventoryLogByCategory(categoryId);
  }

  @Get('logs/slot/:slotId')
  getInventoryLogBySlot(@Param('slotId') slotId: string) {
    return this.inventoryService.getInventoryLogBySlot(slotId);
  }

  // ========== STOCK SUMMARY ENDPOINTS ==========
  @Get('stocks/summary')
  getStockSummary() {
    return this.inventoryService.getStockSummary();
  }

  @Get('stocks/category/:categoryId')
  getStockByCategory(@Param('categoryId') categoryId: string) {
    return this.inventoryService.getStockByCategory(categoryId);
  }

  @Get('stocks/slot/:slotId')
  getStockBySlot(@Param('slotId') slotId: string) {
    return this.inventoryService.getStockBySlot(slotId);
  }
}
