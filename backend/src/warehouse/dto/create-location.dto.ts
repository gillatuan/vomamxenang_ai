import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  warehouseId!: string;

  @IsNotEmpty()
  @IsString()
  zone!: string;

  @IsNotEmpty()
  @IsString()
  rack!: string;

  @IsNotEmpty()
  @IsString()
  slot!: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  capacity?: number;
}
