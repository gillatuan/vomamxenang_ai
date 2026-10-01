import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { PostsModule } from '../posts/posts.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SeoModule } from '../seo/seo.module';
import { DailyContentAdminController, DailyContentCronController } from './daily-content.controller';
import { DailyContentService } from './daily-content.service';

@Module({ imports: [PrismaModule, PostsModule, AiModule, SeoModule], controllers: [DailyContentAdminController, DailyContentCronController], providers: [DailyContentService], exports: [DailyContentService] })
export class DailyContentModule {}
