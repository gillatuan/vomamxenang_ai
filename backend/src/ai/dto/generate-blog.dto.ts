import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
export class GenerateBlogDto {
  @IsString() @MaxLength(250) topic!: string;
  @IsString() @MaxLength(120) category!: string;
  @IsString() @MaxLength(8000) shortBrief!: string;
  @IsOptional() @IsString() @MaxLength(200) primaryKeyword?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) secondaryKeywords?: string[];
  @IsOptional() @IsString() @MaxLength(1000) targetAudience?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(6) @IsString({ each: true }) tones?: string[];
  @IsOptional() @IsString() @MaxLength(80) articleType?: string;
  @IsOptional() @IsString() @MaxLength(300) relatedProduct?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) images?: string[];
}
