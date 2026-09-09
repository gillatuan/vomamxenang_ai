import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenAiProvider } from '../ai/providers/openai.provider';
import { SeoService } from './seo.service';
import { BacklinkResearchService } from './backlink-research.service';
import { SeoController } from './seo.controller';
@Module({ imports: [PrismaModule], controllers: [SeoController], providers: [SeoService, BacklinkResearchService, OpenAiProvider], exports: [SeoService, BacklinkResearchService] })
export class SeoModule {}
