import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuoteLeadDto {
  @IsString() @MaxLength(120) name!: string;
  @IsString() @MaxLength(30) phone!: string;
  @IsOptional() @IsString() @MaxLength(30) zalo?: string;
  @IsOptional() @IsString() @MaxLength(160) company?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10000) quantity?: number;
  @IsOptional() @IsString() @MaxLength(160) forkliftModel?: string;
  @IsOptional() @IsString() @MaxLength(250) location?: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
  @IsOptional() @IsString() @MaxLength(100) productId?: string;
  @IsOptional() @IsString() @MaxLength(500) landingPage?: string;
  // Honeypot. Real customers never fill this field.
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}
