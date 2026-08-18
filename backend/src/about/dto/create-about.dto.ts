import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateAboutDto {
  @IsString() @MaxLength(200) title!: string;
  @IsString() @MaxLength(700) summary!: string;
  @IsString() @MaxLength(12000) content!: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(1000) imageUrl?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
