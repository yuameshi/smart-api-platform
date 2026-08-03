import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse } from 'shared';

/**
 * 响应转换拦截器
 * 将所有成功响应包装起来
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
		return next.handle().pipe(
			map(data => ({
				code: context.switchToHttp().getResponse().statusCode,
				data,
				message: 'success',
			})),
		);
	}
}
