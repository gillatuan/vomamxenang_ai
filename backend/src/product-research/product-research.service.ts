import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '../ai/providers/openrouter.provider';
import { WebSourceCollectorService } from './web-source-collector.service';

type ResearchFact={field:string;value:string;source:string;evidence:string};
@Injectable()
export class ProductResearchService {
  constructor(private prisma: PrismaService, private openrouter: OpenRouterProvider, private collector: WebSourceCollectorService) {}
  list(productId:string){return this.prisma.productContentResearch.findMany({where:{productId},orderBy:{createdAt:'desc'}});}
  create(productId:string,data:any){return this.prisma.productContentResearch.create({data:{productId,sources:data.sources||[],facts:data.facts||[],proposedContent:data.proposedContent||{},status:'READY_FOR_REVIEW'}});}

  async research(productId:string){
    const product=await this.prisma.product.findUnique({where:{id:productId},select:{id:true,sku:true,name:true,size:true,brand:true,tireType:true,condition:true}});
    if(!product)throw new NotFoundException('Không tìm thấy sản phẩm.');
    // Per-product cache: reuse the latest reviewable/published research instead
    // of spending another free-model request for repeated button clicks.
    const cached=await this.prisma.productContentResearch.findFirst({
      where:{productId,status:{in:['READY_FOR_REVIEW','APPROVED','PUBLISHED']}},
      orderBy:{createdAt:'desc'}
    });
    if(cached&&Date.now()-cached.createdAt.getTime()<24*60*60*1000)return cached;

    const query=[product.brand,product.name,product.size,product.tireType,'forklift tire manufacturer specifications'].filter(Boolean).join(' ');
    const pages=await this.collector.collect(query);
    const sources=pages.map(({url,title})=>({url,title}));
    if(!sources.length)throw new BadRequestException('Không tìm thấy nguồn web có nội dung đọc được. Research chưa được tạo.');

    const sourceUrls=sources.map(s=>s.url);
    const schema:any={type:'object',additionalProperties:false,required:['facts','proposedContent','missingInformation'],properties:{
      facts:{type:'array',items:{type:'object',additionalProperties:false,required:['field','value','source','evidence'],properties:{field:{type:'string'},value:{type:'string'},source:{type:'string'},evidence:{type:'string'}}}},
      proposedContent:{type:'object',additionalProperties:false,required:['shortDescription','description','highlights','applications','seo'],properties:{
        shortDescription:{type:'string'},description:{type:'string'},highlights:{type:'array',items:{type:'string'}},applications:{type:'array',items:{type:'string'}},
        seo:{type:'object',additionalProperties:false,required:['title','description','primaryKeyword','keywords','imageAlt'],properties:{title:{type:'string'},description:{type:'string'},primaryKeyword:{type:'string'},keywords:{type:'array',items:{type:'string'}},imageAlt:{type:'string'}}}
      }},
      missingInformation:{type:'array',items:{type:'string'}}
    }};
    const extracted=await this.openrouter.generateStructuredOutput<{facts:ResearchFact[];proposedContent:any;missingInformation:string[]}>(
      'You are an evidence-bound product researcher. Use ONLY the supplied source page text and allowed URLs. Every fact MUST quote a short evidence fragment and use a source URL from allowedSourceUrls. Never infer performance, compatibility, load, durability, application, material, origin, warranty, or benefits. If unsupported, omit the claim and add the field to missingInformation. Proposed content may only restate supported facts plus the product identity fields supplied by the database. No generic marketing filler, checkmarks, emojis, hype, or AI-style claims.',
      {product,sources:pages,allowedSourceUrls:sourceUrls},schema);
    const facts=(extracted.facts||[]).filter(f=>{if(!f.field?.trim()||!f.value?.trim()||!f.evidence?.trim()||!sourceUrls.includes(f.source))return false;const page=pages.find(p=>p.url===f.source);if(!page)return false;const norm=(s:string)=>s.replace(/\\s+/g,' ').trim().toLowerCase();return norm(page.text).includes(norm(f.evidence));});
    if(!facts.length)throw new BadRequestException('Không có fact nào đủ source + evidence. Research chưa được tạo.');
    return this.prisma.productContentResearch.create({data:{productId,sources,facts,proposedContent:{...extracted.proposedContent,missingInformation:extracted.missingInformation},status:'READY_FOR_REVIEW'}});
  }

  async review(id:string,action:'APPROVE'|'REJECT',userId:string){const item=await this.prisma.productContentResearch.findUnique({where:{id}});if(!item)throw new NotFoundException('Không tìm thấy research.');if(item.status!=='READY_FOR_REVIEW')throw new BadRequestException('Research không ở trạng thái chờ review.');return this.prisma.productContentResearch.update({where:{id},data:{status:action==='APPROVE'?'APPROVED':'REJECTED',reviewedBy:userId,reviewedAt:new Date()}});}
  async apply(id:string,userId:string){const item=await this.prisma.productContentResearch.findUnique({where:{id}});if(!item)throw new NotFoundException('Không tìm thấy research.');if(item.status!=='APPROVED')throw new BadRequestException('Research phải được duyệt trước khi apply.');const proposed=(item.proposedContent||{}) as any;const allowed:any={};for(const key of ['shortDescription','description','highlights','specifications','applications','seo','tags'])if(proposed[key]!==undefined)allowed[key]=proposed[key];return this.prisma.$transaction(async tx=>{const product=await tx.product.update({where:{id:item.productId},data:allowed});await tx.productContentResearch.update({where:{id},data:{status:'PUBLISHED',publishedAt:new Date(),reviewedBy:userId}});return product;});}
}
