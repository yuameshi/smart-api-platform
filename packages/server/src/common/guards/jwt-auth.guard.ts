import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// 标记公开访问跳过认证
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const token = request.headers.authorization?.replace('Bearer ', '');
		if (!token) {
			throw new UnauthorizedException('未提供认证令牌');
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);
			(request as any).user = payload;
		} catch {
			throw new UnauthorizedException('认证令牌无效或已过期');
		}

		return true;
	}
}
