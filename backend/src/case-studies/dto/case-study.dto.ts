import { IsBoolean, IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
export class CaseStudyDto {
 @IsString() @MaxLength(200) title!:string;
 @IsString() @MaxLength(220) slug!:string;
 @IsOptional() @IsString() @MaxLength(500) summary?:string;
 @IsOptional() @IsString() @MaxLength(10000) content?:string;
 @IsOptional() @IsString() @MaxLength(50) tireSize?:string;
 @IsOptional() @IsString() @MaxLength(120) forkliftType?:string;
 @IsOptional() @IsString() @MaxLength(120) serviceType?:string;
 @IsOptional() @IsString() @MaxLength(160) area?:string;
 @IsOptional() @IsUrl({require_protocol:true}) @MaxLength(1000) beforeImageUrl?:string;
 @IsOptional() @IsUrl({require_protocol:true}) @MaxLength(1000) afterImageUrl?:string;
 @IsOptional() @IsString() @MaxLength(100) productId?:string;
 @IsOptional() @IsBoolean() isPublished?:boolean;
 @IsOptional() @IsDateString() completedAt?:string;
}
