import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { NotFoundFilter } from '../filters/not-found.filter';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

/**
 * 全局核心模块。
 */
@Global()
@Module({
	providers: [
		// 自动校验与转换请求数据
		{
			provide: APP_PIPE,
			useFactory: () =>
				new ValidationPipe({
					whitelist: true,
					transform: true,
					transformOptions: { enableImplicitConversion: true },
				}),
		},
		// 统一错误响应格式
		{ provide: APP_FILTER, useClass: NotFoundFilter },
		{ provide: APP_FILTER, useClass: HttpExceptionFilter },
		// 统一成功响应格式
		{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
	],
})
export class CoreModule {}
