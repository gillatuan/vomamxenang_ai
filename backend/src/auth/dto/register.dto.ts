import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

const ROLES = ['ADMIN_MANAGER', 'STOREKEEPER'];

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(ROLES)
  role?: string;
}
