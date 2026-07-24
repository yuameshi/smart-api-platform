import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP 异常过滤器
 * 捕获所有 HttpException 异常，返回统一格式的 JSON 错误响应
 * 响应格式: { statusCode, message, timestamp, path }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const statusCode = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		// 提取错误消息，兼容字符串和对象格式
		const message =
			typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || exception.message;

		response.status(statusCode).json({
			statusCode,
			message,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
