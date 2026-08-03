import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import type { CreateUserRequest } from 'shared';

export class CreateUserDto implements CreateUserRequest {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	username!: string;

	@IsString()
	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password!: string;

	@IsOptional()
	@IsBoolean()
	isAdmin?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
