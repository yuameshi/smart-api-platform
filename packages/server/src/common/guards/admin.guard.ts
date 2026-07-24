import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const user = (request as any).user;

		if (user?.isAdmin !== true) {
			throw new ForbiddenException('需要管理员权限');
		}

		return true;
	}
}
