import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { PostsService } from '../posts/posts.service';
import { GenerateProductDto } from './dto/generate-product.dto';
import { GenerateBlogDto } from './dto/generate-blog.dto';
import { GenerateSeoDto } from './dto/generate-seo.dto';
import { ProductAiService } from './services/product-ai.service';
import { BlogAiService } from './services/blog-ai.service';
import { SeoAiService } from './services/seo-ai.service';
import { GeneratedBlog, GeneratedProduct, GeneratedSeo } from './types/ai.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly requests = new Map<string, number[]>();
  constructor(private prisma:PrismaService, private products:ProductsService, private posts:PostsService, private productAi:ProductAiService, private blogAi:BlogAiService, private seoAi:SeoAiService) {}
  private checkLimit(userId:string){const now=Date.now();const recent=(this.requests.get(userId)||[]).filter(t=>now-t<60000);if(recent.length>=10)throw new HttpException('Too many AI requests. Please wait a minute.',HttpStatus.TOO_MANY_REQUESTS);recent.push(now);this.requests.set(userId,recent);}
  private validateImages(images?:string[]){for(const image of images||[]){if(image.length>7_000_000||!/^data:image\/(jpeg|png|webp);base64,/.test(image))throw new BadRequestException('Images must be JPG, PNG, or WEBP and no larger than 5 MB.');}}
  private historyInput(input:Record<string,unknown>){return {...input,images:Array.isArray(input.images)?input.images.map((_,imageIndex)=>({imageIndex,received:true})):undefined};}
  private async run<T>(type:'PRODUCT'|'BLOG'|'SEO',userId:string,input:Record<string,unknown>,work:()=>Promise<T>){this.checkLimit(userId);const started=Date.now();const generation=await (this.prisma as any).aiGeneration.create({data:{type,prompt:`${type.toLowerCase()}.prompt.v1`,input:this.historyInput(input),status:'PENDING',provider:'openai',createdById:userId}});try{const output=await work();await (this.prisma as any).aiGeneration.update({where:{id:generation.id},data:{output,status:'SUCCESS',model:process.env.OPENAI_MODEL||'gpt-4.1-mini'}});this.logger.log({type,userId,requestId:generation.id,duration:Date.now()-started,status:'success'});return output;}catch(error){await (this.prisma as any).aiGeneration.update({where:{id:generation.id},data:{status:'FAILED',error:'Generation failed'}});this.logger.warn({type,userId,requestId:generation.id,duration:Date.now()-started,status:'failed'});throw error;}}
  generateProduct(userId:string,input:GenerateProductDto){this.validateImages(input.images);return this.run('PRODUCT',userId,input as unknown as Record<string,unknown>,()=>this.productAi.generate(input));}
  generateBlog(userId:string,input:GenerateBlogDto){this.validateImages(input.images);return this.run('BLOG',userId,input as unknown as Record<string,unknown>,()=>this.blogAi.generate(input));}
  async generateSeo(userId:string,input:GenerateSeoDto){let source:unknown=input;if(input.sourceType==='PRODUCT'){const product=await this.products.findOneAdmin(input.sourceId!);if(!product)throw new NotFoundException('Product not found.');source={sourceType:'PRODUCT',title:product.name,content:product.description,primaryKeyword:input.primaryKeyword};}if(input.sourceType==='BLOG'){const post=await this.posts.findOneAdmin(input.sourceId!);if(!post)throw new NotFoundException('Blog post not found.');source={sourceType:'BLOG',title:post.title,content:post.content,primaryKeyword:input.primaryKeyword};}return this.run('SEO',userId,input as unknown as Record<string,unknown>,()=>this.seoAi.generate(source));}
  saveProductDraft(output:GeneratedProduct){return this.products.create({sku:`AI-DRAFT-${Date.now()}`,name:output.name,importPrice:0,description:output.description,slug:output.slug,shortDescription:output.shortDescription,highlights:output.highlights,specifications:output.specifications,applications:output.applications,seo:output.seo,tags:output.tags,status:'DRAFT'});}
  saveBlogDraft(output:GeneratedBlog){return this.posts.create({title:output.title,content:output.content,slug:output.slug,excerpt:output.excerpt,tableOfContents:output.tableOfContents,seo:output.seo,tags:output.tags,status:'DRAFT'});}
  async applySeo(input:{sourceType:'PRODUCT'|'BLOG';sourceId:string;seo:GeneratedSeo}){
    const keywords=[input.seo.primaryKeyword,...input.seo.secondaryKeywords].filter(Boolean);
    const seo={
      title:input.seo.title,
      description:input.seo.metaDescription,
      keywords,
      openGraph:{title:input.seo.ogTitle||input.seo.title,description:input.seo.ogDescription||input.seo.metaDescription,type:input.sourceType==='PRODUCT'?'product':'article'},
      twitter:{card:'summary_large_image',title:input.seo.ogTitle||input.seo.title,description:input.seo.ogDescription||input.seo.metaDescription},
      robots:input.seo.robots||'index,follow',
      ...(input.seo.canonicalPath?.startsWith('/')?{canonicalPath:input.seo.canonicalPath}:{}),
    };
    if(input.sourceType==='PRODUCT')return this.products.update(input.sourceId,{slug:input.seo.slug,seo,tags:input.seo.tags});
    return this.posts.update(input.sourceId,{slug:input.seo.slug,seo,tags:input.seo.tags});
  }
}
