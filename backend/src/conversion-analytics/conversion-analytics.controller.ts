import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConversionEventType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ConversionAnalyticsService } from './conversion-analytics.service';

class EventDto {
  @IsEnum(ConversionEventType) type!: ConversionEventType;
  @IsString() @MaxLength(500) path!: string;
  @IsOptional() @IsString() @MaxLength(100) productId?: string;
  @IsOptional() @IsString() @MaxLength(250) context?: string;
  @IsOptional() @IsString() @MaxLength(100) sessionId?: string;
}
@Controller('conversion-analytics')
export class ConversionAnalyticsController {
  constructor(private s: ConversionAnalyticsService) {}
  @Post('event') event(@Body() d: EventDto) { return this.s.create(d); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN_MANAGER')
  @Get('report') report() { return this.s.report(); }
}
