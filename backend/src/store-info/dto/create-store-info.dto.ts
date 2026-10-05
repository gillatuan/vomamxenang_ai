import { IsBoolean, IsEmail, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateStoreInfoDto {
  @IsString() @MaxLength(200) name!: string;
  @IsString() @MaxLength(500) address!: string;
  @IsString() @MaxLength(30) phone!: string;
  @IsOptional() @IsEmail() @MaxLength(200) email?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) website?: string;
  @IsOptional() @IsString() @MaxLength(50) taxCode?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(1000) logoUrl?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) facebookUrl?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(1000) googleMapsUrl?: string;
  @IsOptional() @IsNumber() @IsLatitude() latitude?: number;
  @IsOptional() @IsNumber() @IsLongitude() longitude?: number;
  @IsOptional() @IsString() @MaxLength(500) businessHours?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
