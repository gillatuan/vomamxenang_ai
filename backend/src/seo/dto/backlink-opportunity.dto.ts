import { BacklinkStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBacklinkOpportunityDto {
  @IsEnum(BacklinkStatus)
  status!: BacklinkStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
