import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { BacklinkStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SeoService } from './seo.service';
import { BacklinkResearchService } from './backlink-research.service';
class ResearchDto { @IsString() @MinLength(1) @MaxLength(500) query!: string; }
class ReviewDto { @IsEnum(BacklinkStatus) status!: BacklinkStatus; @IsOptional() @IsString() @MaxLength(5000) notes?: string; }
class LinkReviewDto { @IsIn(['APPROVED', 'REJECTED']) status!: string; }
class VerifyDto { @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) @MaxLength(2000) sourceUrl!: string; }
@Controller('admin/seo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MANAGER')
export class SeoController {
  constructor(private readonly seo: SeoService, private readonly backlinks: BacklinkResearchService) {}
  @Get() overview() { return this.seo.overview(); }
  @Post('audit') audit() { return this.seo.audit(); }
  @Get('internal-links') links() { return this.seo.suggestions(); }
  @Patch('internal-links/:id') reviewLink(@Param('id') id: string, @Body() dto: LinkReviewDto) { return this.seo.reviewSuggestion(id, dto.status); }
  @Get('opportunities') opportunities() { return this.backlinks.list(); }
  @Get('opportunities/:id') opportunity(@Param('id') id: string) { return this.backlinks.get(id); }
  @Post('research') research(@Body() dto: ResearchDto) { return this.backlinks.research(dto.query); }
  @Post('opportunities/:id/analyze') analyze(@Param('id') id: string) { return this.backlinks.analyze(id); }
  @Patch('opportunities/:id') review(@Param('id') id: string, @Body() dto: ReviewDto) { return this.backlinks.review(id, dto.status, dto.notes); }
  @Post('opportunities/:id/outreach') outreach(@Param('id') id: string) { return this.backlinks.outreach(id); }
  @Post('opportunities/:id/verify') verify(@Param('id') id: string, @Body() dto: VerifyDto) { return this.backlinks.verify(id, dto.sourceUrl); }
}
