import { Module } from '@nestjs/common';
import { SalesQuotesController } from './sales-quotes.controller';
import { SalesQuotesService } from './sales-quotes.service';
@Module({controllers:[SalesQuotesController],providers:[SalesQuotesService]})
export class SalesQuotesModule{}
