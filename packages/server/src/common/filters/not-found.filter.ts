import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 捕获 NotFoundException，返回404
 */
@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
	private readonly logger = new Logger(NotFoundFilter.name);

	catch(exception: NotFoundException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		this.logger.warn(`${request.method} ${request.url} -> 404: ${exception.message}`);

		response.status(404).json({
			code: 404,
			data: null,
			message: exception.message,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
