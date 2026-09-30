import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { PostsModule } from '../posts/posts.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiProvider } from './providers/openai.provider';
import { ProductAiService } from './services/product-ai.service';
import { BlogAiService } from './services/blog-ai.service';
import { SeoAiService } from './services/seo-ai.service';
@Module({imports:[ProductsModule,PostsModule],controllers:[AiController],providers:[AiService,OpenAiProvider,{provide:'AI_PROVIDER',useExisting:OpenAiProvider},ProductAiService,BlogAiService,SeoAiService],exports:[BlogAiService,OpenAiProvider]})
export class AiModule {}
