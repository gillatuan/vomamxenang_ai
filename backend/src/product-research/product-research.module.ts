import { Module } from '@nestjs/common';
import { ProductResearchController } from './product-research.controller';
import { ProductResearchService } from './product-research.service';
import { AiModule } from '../ai/ai.module';

@Module({ imports: [AiModule], controllers: [ProductResearchController], providers: [ProductResearchService] })
export class ProductResearchModule {}
