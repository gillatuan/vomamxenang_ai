import { IsIn, IsNumber, IsString, Min } from 'class-validator';

export class UpdatePriceMatrixDto {
  @IsString()
  productId!: string;

  @IsIn(['RETAIL', 'B2B_TIER1', 'B2B_TIER2'])
  customerType!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
