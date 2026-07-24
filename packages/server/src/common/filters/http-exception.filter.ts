import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 捕获所有HttpException异常，返回统一错误响应
 * { code, data: null, message, timestamp, path }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const statusCode = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		// 提取错误消息，兼容字符串和对象格式
		const message =
			typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || exception.message;

		// 分级日志: 5xx 用 error (含 stack), 4xx 用 warn
		if (statusCode >= 500) {
			this.logger.error(`${request.method} ${request.url} -> ${statusCode}: ${message}`, exception.stack);
		} else {
			this.logger.warn(`${request.method} ${request.url} -> ${statusCode}: ${message}`);
		}

		response.status(statusCode).json({
			code: statusCode,
			data: null,
			message,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
