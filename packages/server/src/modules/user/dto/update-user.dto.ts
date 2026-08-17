import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { UpdateUserRequest } from 'shared';

export class UpdateUserDto implements UpdateUserRequest {
	@IsOptional()
	@IsString()
	username?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(6)
	password?: string;

	@IsOptional()
	@IsBoolean()
	isAdmin?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
