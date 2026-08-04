import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import type { UpdateProfileRequest } from 'shared';

/**
 * 用户自助修改个人设置请求体
 * 允许用户修改自己的用户名、邮箱或密码
 */
export class UpdateProfileDto implements UpdateProfileRequest {
	@IsOptional()
	@IsString()
	@MinLength(3)
	username?: string;

	@IsOptional()
	@IsString()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MinLength(6)
	password?: string;
}
