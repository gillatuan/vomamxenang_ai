import { Injectable, NotFoundException } from '@nestjs/common';import { PrismaService } from '../prisma/prisma.service';import { CaseStudyDto } from './dto/case-study.dto';
@Injectable() export class CaseStudiesService{constructor(private prisma:PrismaService){}
 public(){return this.prisma.caseStudy.findMany({where:{isPublished:true},orderBy:[{completedAt:'desc'},{createdAt:'desc'}],include:{product:{select:{id:true,name:true,slug:true,size:true}}}})}
 async publicOne(slug:string){const x=await this.prisma.caseStudy.findFirst({where:{slug,isPublished:true},include:{product:{select:{id:true,name:true,slug:true,size:true}}}});if(!x)throw new NotFoundException();return x}
 all(){return this.prisma.caseStudy.findMany({orderBy:{createdAt:'desc'},include:{product:{select:{id:true,name:true,slug:true,size:true}}}})}
 create(dto:CaseStudyDto){return this.prisma.caseStudy.create({data:{...dto,completedAt:dto.completedAt?new Date(dto.completedAt):undefined}})}
 update(id:string,dto:CaseStudyDto){return this.prisma.caseStudy.update({where:{id},data:{...dto,completedAt:dto.completedAt?new Date(dto.completedAt):undefined}})}
 remove(id:string){return this.prisma.caseStudy.delete({where:{id}})}
}
