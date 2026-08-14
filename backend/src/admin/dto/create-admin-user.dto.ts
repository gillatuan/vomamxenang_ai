import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
export class CreateAdminUserDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; @IsIn(['ADMIN_MANAGER', 'STOREKEEPER']) role!: 'ADMIN_MANAGER' | 'STOREKEEPER'; }
