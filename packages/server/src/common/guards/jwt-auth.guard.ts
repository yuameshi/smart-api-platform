import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * JWT 认证守卫（占位实现）
 * 当前始终返回 true，允许所有请求通过
 * TODO: 后续接入真实的 JWT 认证逻辑，验证 token 有效性
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		// 占位守卫：暂时放行所有请求
		// 后续将实现 JWT token 校验逻辑
		return true;
	}
}
