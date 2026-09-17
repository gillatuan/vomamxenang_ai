import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateInternalLinkSuggestionDto {
  @IsIn(['PRODUCT', 'POST'])
  sourceType!: 'PRODUCT' | 'POST';

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sourceId!: string;

  @IsIn(['PRODUCT', 'POST'])
  targetType!: 'PRODUCT' | 'POST';

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  targetId!: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  sourceUrl!: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  targetUrl!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  anchorText!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  reason!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;
}

export class UpdateInternalLinkSuggestionDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  anchorText?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  reason?: string;
}
