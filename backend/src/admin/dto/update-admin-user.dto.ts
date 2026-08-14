import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateAdminUserDto { @IsOptional() @IsIn(['ADMIN_MANAGER', 'STOREKEEPER']) role?: 'ADMIN_MANAGER' | 'STOREKEEPER'; @IsOptional() @IsString() @MinLength(8) password?: string; }
