import { Module } from '@nestjs/common';
import { QuoteLeadsController } from './quote-leads.controller';
import { QuoteLeadsService } from './quote-leads.service';

@Module({ controllers: [QuoteLeadsController], providers: [QuoteLeadsService] })
export class QuoteLeadsModule {}
