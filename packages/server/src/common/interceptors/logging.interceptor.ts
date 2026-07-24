import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 日志拦截器
 * 拦截所有 HTTP 请求，记录请求路径、请求方法和耗时
 * 输出格式: [请求] GET /api/user/hello - 12ms
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const { method, url } = request;
		const now = Date.now();

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - now;
				console.log(`[请求] ${method} ${url} - ${duration}ms`);
			}),
		);
	}
}
