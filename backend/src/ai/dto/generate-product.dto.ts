import { IsArray, IsIn, IsOptional, IsString, MaxLength, ArrayMaxSize } from 'class-validator';
export class GenerateProductDto {
  @IsString() @MaxLength(120) category!: string;
  @IsString() @MaxLength(200) productTopic!: string;
  @IsString() @MaxLength(8000) rawDescription!: string;
  @IsOptional() @IsString() @MaxLength(120) brand?: string;
  @IsOptional() @IsString() @MaxLength(120) model?: string;
  @IsOptional() @IsString() @MaxLength(120) condition?: string;
  @IsOptional() @IsString() @MaxLength(4000) specifications?: string;
  @IsOptional() @IsString() @MaxLength(2000) application?: string;
  @IsOptional() @IsString() @MaxLength(1000) material?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsString() @MaxLength(1000) targetCustomer?: string;
  @IsOptional() @IsString() @MaxLength(200) seoKeyword?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) images?: string[];
  @IsOptional() @IsIn(['all', 'title', 'description', 'seo']) regenerateField?: string;
}
