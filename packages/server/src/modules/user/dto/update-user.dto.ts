import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
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
