import { Body,Controller,Delete,Get,Param,Patch,Post,UseGuards } from '@nestjs/common';import { JwtAuthGuard } from '../auth/jwt-auth.guard';import { Roles } from '../auth/roles.decorator';import { RolesGuard } from '../auth/roles.guard';import { CaseStudyDto } from './dto/case-study.dto';import { CaseStudiesService } from './case-studies.service';
@Controller('case-studies') export class CaseStudiesController{constructor(private s:CaseStudiesService){}@Get() public(){return this.s.public()}@Get(':slug') publicOne(@Param('slug')slug:string){return this.s.publicOne(slug)}
@UseGuards(JwtAuthGuard,RolesGuard)@Roles('ADMIN_MANAGER')@Get('admin/all') all(){return this.s.all()}
@UseGuards(JwtAuthGuard,RolesGuard)@Roles('ADMIN_MANAGER')@Post('admin') create(@Body()d:CaseStudyDto){return this.s.create(d)}
@UseGuards(JwtAuthGuard,RolesGuard)@Roles('ADMIN_MANAGER')@Patch('admin/:id') update(@Param('id')id:string,@Body()d:CaseStudyDto){return this.s.update(id,d)}
@UseGuards(JwtAuthGuard,RolesGuard)@Roles('ADMIN_MANAGER')@Delete('admin/:id') remove(@Param('id')id:string){return this.s.remove(id)}}
