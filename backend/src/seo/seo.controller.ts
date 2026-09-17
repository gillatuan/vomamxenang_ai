import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SeoService } from './seo.service';
import { BacklinkResearchService } from './backlink-research.service';
import { CreateContentCampaignDto, UpdateContentCampaignDto } from './dto/campaign.dto';
import { IdParamDto } from './dto/id-param.dto';
import { CreateInternalLinkSuggestionDto, UpdateInternalLinkSuggestionDto } from './dto/internal-link.dto';
import { ListSeoKeywordsDto, PaginationDto } from './dto/list-seo.dto';
import { CreateContentSeoAuditDto } from './dto/seo-audit.dto';
import { CreateSeoKeywordDto, UpdateSeoKeywordDto } from './dto/seo-keyword.dto';
import { UpdateBacklinkOpportunityDto } from './dto/backlink-opportunity.dto';

class ResearchDto { @IsString() @MinLength(1) @MaxLength(500) query!: string; }
class VerifyDto { @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) @MaxLength(2000) sourceUrl!: string; }
@Controller('admin/seo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MANAGER')
export class SeoController {
  constructor(private readonly seo: SeoService, private readonly backlinks: BacklinkResearchService) {}
  @Get() overview() { return this.seo.overview(); }
  @Get('products') products() { return this.seo.products(); }
  @Get('posts') posts() { return this.seo.posts(); }

  @Get('keywords') keywords(@Query() query: ListSeoKeywordsDto) { return this.seo.listKeywords(query); }
  @Post('keywords') createKeyword(@Body() dto: CreateSeoKeywordDto) { return this.seo.createKeyword(dto); }
  @Patch('keywords/:id') updateKeyword(@Param() params: IdParamDto, @Body() dto: UpdateSeoKeywordDto) { return this.seo.updateKeyword(params.id, dto); }
  @Delete('keywords/:id') removeKeyword(@Param() params: IdParamDto) { return this.seo.removeKeyword(params.id); }

  @Get('audits') audits(@Query() query: PaginationDto) { return this.seo.listAudits(query); }
  @Post('audits') createContentAudit(@Body() dto: CreateContentSeoAuditDto) { return this.seo.createContentAudit(dto); }
  @Get('audits/:id') getAudit(@Param() params: IdParamDto) { return this.seo.getAudit(params.id); }

  @Post('audit') audit() { return this.seo.audit(); }
  @Get('internal-links') links() { return this.seo.suggestions(); }
  @Post('internal-links') createInternalLink(@Body() dto: CreateInternalLinkSuggestionDto) { return this.seo.createInternalLink(dto); }
  @Patch('internal-links/:id') updateInternalLink(@Param() params: IdParamDto, @Body() dto: UpdateInternalLinkSuggestionDto) { return this.seo.updateInternalLink(params.id, dto); }

  @Get('opportunities') opportunities() { return this.backlinks.list(); }
  @Get('opportunities/:id') opportunity(@Param() params: IdParamDto) { return this.backlinks.get(params.id); }
  @Get('backlinks/opportunities') backlinkOpportunities() { return this.backlinks.list(); }
  @Post('research') research(@Body() dto: ResearchDto) { return this.backlinks.research(dto.query); }
  @Post('opportunities/:id/analyze') analyze(@Param() params: IdParamDto) { return this.backlinks.analyze(params.id); }
  @Patch('opportunities/:id') review(@Param() params: IdParamDto, @Body() dto: UpdateBacklinkOpportunityDto) { return this.backlinks.review(params.id, dto.status, dto.notes); }
  @Patch('backlinks/opportunities/:id') reviewBacklinkOpportunity(@Param() params: IdParamDto, @Body() dto: UpdateBacklinkOpportunityDto) { return this.backlinks.review(params.id, dto.status, dto.notes); }
  @Post('opportunities/:id/outreach') outreach(@Param() params: IdParamDto) { return this.backlinks.outreach(params.id); }
  @Post('opportunities/:id/verify') verify(@Param() params: IdParamDto, @Body() dto: VerifyDto) { return this.backlinks.verify(params.id, dto.sourceUrl); }

  @Get('campaigns') campaigns(@Query() query: PaginationDto) { return this.seo.listCampaigns(query); }
  @Post('campaigns') createCampaign(@Body() dto: CreateContentCampaignDto) { return this.seo.createCampaign(dto); }
  @Get('campaigns/:id') campaign(@Param() params: IdParamDto) { return this.seo.getCampaign(params.id); }
  @Patch('campaigns/:id') updateCampaign(@Param() params: IdParamDto, @Body() dto: UpdateContentCampaignDto) { return this.seo.updateCampaign(params.id, dto); }
}
