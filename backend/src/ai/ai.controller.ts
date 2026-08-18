import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AiService } from './ai.service';
import { GenerateBlogDto } from './dto/generate-blog.dto';
import { GenerateProductDto } from './dto/generate-product.dto';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { GeneratedBlog, GeneratedProduct, GeneratedSeo } from './types/ai.types';
@Controller('ai') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('ADMIN_MANAGER')
export class AiController { constructor(private service:AiService){}
  @Post('generate/product') product(@Req() req:any,@Body() dto:GenerateProductDto){return this.service.generateProduct(req.user.sub,dto);}
  @Post('generate/blog') blog(@Req() req:any,@Body() dto:GenerateBlogDto){return this.service.generateBlog(req.user.sub,dto);}
  @Post('generate/seo') seo(@Req() req:any,@Body() dto:GenerateSeoDto){return this.service.generateSeo(req.user.sub,dto);}
  @Post('draft/product') saveProduct(@Body() output:GeneratedProduct){return this.service.saveProductDraft(output);}
  @Post('draft/blog') saveBlog(@Body() output:GeneratedBlog){return this.service.saveBlogDraft(output);}
  @Post('apply/seo') applySeo(@Body() input:{sourceType:'PRODUCT'|'BLOG';sourceId:string;seo:GeneratedSeo}){return this.service.applySeo(input);}
}
