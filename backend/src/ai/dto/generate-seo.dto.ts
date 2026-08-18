import { IsIn, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
export class GenerateSeoDto {
  @IsIn(['PRODUCT', 'BLOG', 'CUSTOM']) sourceType!: 'PRODUCT' | 'BLOG' | 'CUSTOM';
  @ValidateIf((o) => o.sourceType !== 'CUSTOM') @IsString() sourceId?: string;
  @ValidateIf((o) => o.sourceType === 'CUSTOM') @IsString() @MaxLength(250) title?: string;
  @ValidateIf((o) => o.sourceType === 'CUSTOM') @IsString() @MaxLength(12000) content?: string;
  @IsOptional() @IsString() @MaxLength(200) primaryKeyword?: string;
}
