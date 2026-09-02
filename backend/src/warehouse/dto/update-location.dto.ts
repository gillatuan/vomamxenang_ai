import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  rack?: string;

  @IsOptional()
  @IsString()
  slot?: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;
}
