import { SeoKeywordIntent, SeoKeywordStatus, SeoKeywordType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

export class CreateSeoKeywordDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  keyword!: string;

  @IsOptional()
  @IsEnum(SeoKeywordType)
  type?: SeoKeywordType;

  @IsOptional()
  @IsEnum(SeoKeywordIntent)
  intent?: SeoKeywordIntent;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cluster?: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  targetUrl!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  productId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  postId?: string;

  @IsOptional()
  @IsEnum(SeoKeywordStatus)
  status?: SeoKeywordStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class UpdateSeoKeywordDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  keyword?: string;

  @IsOptional()
  @IsEnum(SeoKeywordType)
  type?: SeoKeywordType;

  @IsOptional()
  @IsEnum(SeoKeywordIntent)
  intent?: SeoKeywordIntent;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cluster?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  targetUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  postId?: string;

  @IsOptional()
  @IsEnum(SeoKeywordStatus)
  status?: SeoKeywordStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
