import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContentSeoAuditDto {
  @IsIn(['PRODUCT', 'POST'])
  sourceType!: 'PRODUCT' | 'POST';

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  sourceId!: string;
}
