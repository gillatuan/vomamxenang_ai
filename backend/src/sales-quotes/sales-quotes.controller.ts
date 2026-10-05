import { Body, Controller, Get, Patch, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SalesQuoteStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { AuthenticatedRequest } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SalesQuotesService } from './sales-quotes.service';

class ItemDto{@IsOptional() @IsString() productId?:string;@IsString() @MaxLength(250) description!:string;@IsInt() @Min(1) quantity!:number;@IsNumber() @Min(0) unitPrice!:number}
class CreateDto{@IsOptional() @IsString() leadId?:string;@IsOptional() @IsString() clientId?:string;@IsString() @MaxLength(150) customerName!:string;@IsString() @MaxLength(50) phone!:string;@IsOptional() @IsString() @MaxLength(150) company?:string;@IsOptional() @IsNumber() @Min(0) discount?:number;@IsOptional() @IsString() @MaxLength(2000) note?:string;@IsOptional() @IsISO8601() validUntil?:string;@IsArray() @ValidateNested({each:true}) @Type(()=>ItemDto) items!:ItemDto[]}
class StatusDto{@IsEnum(SalesQuoteStatus) status!:SalesQuoteStatus}
class QuoteLocationDto{@IsString() itemId!:string;@IsString() locationId!:string}
class ConvertDto{@IsString() clientId!:string;@IsArray() @ValidateNested({each:true}) @Type(()=>QuoteLocationDto) locations!:QuoteLocationDto[]}

@Controller('sales-quotes') @UseGuards(JwtAuthGuard,RolesGuard) @Roles('ADMIN_MANAGER')
export class SalesQuotesController{
 constructor(private service:SalesQuotesService){}
 @Get() all(){return this.service.findAll()}
 @Post() create(@Req() req:AuthenticatedRequest,@Body() body:CreateDto){return this.service.create(body,req.user.sub)}
 @Post(':id/convert-to-order') convert(@Param('id') id:string,@Body() body:ConvertDto){return this.service.convertToOrder(id,body.clientId,body.locations)}
 @Patch(':id/status') status(@Req() req:AuthenticatedRequest,@Param('id') id:string,@Body() body:StatusDto){return this.service.updateStatus(id,body.status,req.user.sub)}
}
