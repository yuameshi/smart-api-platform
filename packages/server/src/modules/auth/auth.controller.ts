import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * 认证控制器（占位控制器）
 *
 * 当前仅提供测试路由，用于验证模块是否正常加载。
 * 未来将添加登录、注册、获取令牌等接口。
 */
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * 测试路由 — 验证认证服务是否正常工作
	 * GET /auth/hello
	 */
	@Get('hello')
	hello() {
		return { message: this.authService.hello() };
	}
}
