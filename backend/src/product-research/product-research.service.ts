import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductResearchService {
  constructor(private prisma: PrismaService) {}

  list(productId: string) {
    return this.prisma.productContentResearch.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } });
  }

  create(productId: string, data: any) {
    return this.prisma.productContentResearch.create({
      data: { productId, sources: data.sources || [], facts: data.facts || [], proposedContent: data.proposedContent || {}, status: 'READY_FOR_REVIEW' },
    });
  }

  async review(id: string, action: 'APPROVE'|'REJECT', userId: string) {
    const item=await this.prisma.productContentResearch.findUnique({ where: { id } });
    if(!item) throw new NotFoundException('Không tìm thấy research.');
    if(item.status!=='READY_FOR_REVIEW') throw new BadRequestException('Research không ở trạng thái chờ review.');
    return this.prisma.productContentResearch.update({ where:{id}, data:{ status: action==='APPROVE'?'APPROVED':'REJECTED', reviewedBy:userId, reviewedAt:new Date() } });
  }

  async apply(id: string, userId: string) {
    const item=await this.prisma.productContentResearch.findUnique({ where:{id} });
    if(!item) throw new NotFoundException('Không tìm thấy research.');
    if(item.status!=='APPROVED') throw new BadRequestException('Research phải được duyệt trước khi apply.');
    const proposed=(item.proposedContent || {}) as any;
    const allowed:any={};
    for(const key of ['shortDescription','description','highlights','specifications','applications','seo','tags']) if(proposed[key]!==undefined) allowed[key]=proposed[key];
    return this.prisma.$transaction(async tx=>{
      const product=await tx.product.update({ where:{id:item.productId}, data:allowed });
      await tx.productContentResearch.update({ where:{id}, data:{status:'PUBLISHED',publishedAt:new Date(),reviewedBy:userId} });
      return product;
    });
  }
}
