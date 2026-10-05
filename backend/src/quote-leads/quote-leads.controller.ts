import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateQuoteLeadDto } from './dto/create-quote-lead.dto';
import { QuoteLeadsService } from './quote-leads.service';

const statuses = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'] as const;
type Status = typeof statuses[number];
class StatusDto { @IsIn(statuses) status!: Status; }
class CrmDto {
  @IsOptional() @IsString() assigneeId?: string | null;
  @IsOptional() @IsString() followUpAt?: string | null;
}
class NoteDto { @IsString() @MaxLength(2000) content!: string; }

@Controller('quote-leads')
export class QuoteLeadsController {
  constructor(private service: QuoteLeadsService) {}
  @Post() @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  create(@Body() body: CreateQuoteLeadDto, @UploadedFile() file?: Express.Multer.File) { return this.service.create(body, file); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get() findAll(@Query('status') status?: string, @Query('assigneeId') assigneeId?: string, @Query('overdue') overdue?: string) {
    if (status && !statuses.includes(status as Status)) throw new BadRequestException('Trạng thái lead không hợp lệ.');
    return this.service.findAll({ status: status as Status | undefined, assigneeId, overdue: overdue === 'true' });
  }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get('assignees') assignees() { return this.service.assignees(); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Patch(':id/status') updateStatus(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: StatusDto) { return this.service.updateStatus(id, body.status, req.user.sub); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Patch(':id/crm') updateCrm(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CrmDto) { return this.service.updateCrm(id, body, req.user.sub); }

  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Post(':id/notes') addNote(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: NoteDto) { return this.service.addNote(id, body.content, req.user.sub); }
}
