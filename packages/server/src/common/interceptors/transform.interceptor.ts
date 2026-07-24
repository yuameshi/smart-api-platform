import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WrappedResponse<T> {
	readonly code: number;
	readonly data: T;
	readonly message: string;
}

/**
 * 响应转换拦截器
 * 将所有成功响应包装起来
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<WrappedResponse<T>> {
		return next.handle().pipe(
			map(data => ({
				code: context.switchToHttp().getResponse().statusCode,
				data,
				message: 'success',
			})),
		);
	}
}
