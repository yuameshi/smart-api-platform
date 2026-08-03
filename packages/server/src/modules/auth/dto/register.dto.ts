import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { RegisterRequest } from 'shared';

export class RegisterDto implements RegisterRequest {
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
}
