import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateQuoteLeadDto } from './dto/create-quote-lead.dto';
import { QuoteLeadsService } from './quote-leads.service';

@Controller('quote-leads')
export class QuoteLeadsController {
  constructor(private service: QuoteLeadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  create(@Body() body: CreateQuoteLeadDto, @UploadedFile() file?: Express.Multer.File) {
    return this.service.create(body, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: 'NEW'|'CONTACTED'|'QUOTED'|'WON'|'LOST') {
    return this.service.updateStatus(id, status);
  }
}
