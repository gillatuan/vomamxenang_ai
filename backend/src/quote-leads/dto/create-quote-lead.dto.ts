import { IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateQuoteLeadDto {
  @IsString() @MaxLength(120) name!: string;
  @IsString() @MaxLength(30) phone!: string;
  @IsOptional() @IsString() @MaxLength(30) zalo?: string;
  @IsOptional() @IsString() @MaxLength(160) company?: string;
  // Multipart form fields arrive as strings; normalize to Int in the service after validation.
  @IsOptional() @IsNumberString({ no_symbols: true }) quantity?: string;
  @IsOptional() @IsString() @MaxLength(160) forkliftModel?: string;
  @IsOptional() @IsString() @MaxLength(250) location?: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
  @IsOptional() @IsString() @MaxLength(100) productId?: string;
  @IsOptional() @IsString() @MaxLength(500) landingPage?: string;
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}
