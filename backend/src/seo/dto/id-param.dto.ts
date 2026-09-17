import { IsString, MaxLength, MinLength } from 'class-validator';

export class IdParamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  id!: string;
}
