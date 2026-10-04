import { Module } from '@nestjs/common';
import { ProductResearchController } from './product-research.controller';
import { ProductResearchService } from './product-research.service';

@Module({ controllers: [ProductResearchController], providers: [ProductResearchService] })
export class ProductResearchModule {}
