import { Module } from '@nestjs/common';
import { ProductResearchController } from './product-research.controller';
import { ProductResearchService } from './product-research.service';
import { AiModule } from '../ai/ai.module';
import { WebSourceCollectorService } from './web-source-collector.service';

@Module({ imports: [AiModule], controllers: [ProductResearchController], providers: [ProductResearchService, WebSourceCollectorService] })
export class ProductResearchModule {}
