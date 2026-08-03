import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import type { UpdateUserRequest } from 'shared';

export class UpdateUserDto implements UpdateUserRequest {
	@IsOptional()
	@IsString()
	username?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsBoolean()
	isAdmin?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
