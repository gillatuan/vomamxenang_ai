import { Type } from 'class-transformer';
import { ContentStatus } from '@prisma/client';
import { ArrayMaxSize, ArrayUnique, IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export class CampaignPostInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  postId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  plannedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CreateContentCampaignDto {
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  goal?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((entry: CampaignPostInputDto) => entry.postId)
  @ValidateNested({ each: true })
  @Type(() => CampaignPostInputDto)
  posts?: CampaignPostInputDto[];
}

export class UpdateContentCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  goal?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((entry: CampaignPostInputDto) => entry.postId)
  @ValidateNested({ each: true })
  @Type(() => CampaignPostInputDto)
  posts?: CampaignPostInputDto[];
}
