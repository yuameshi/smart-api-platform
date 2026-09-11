import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';
import { HttpRequestsService } from './http-request.service';
import { SendHttpRequestDto } from './dto/send-http-request.dto';

@Controller('http-request')
export class HttpRequestController {
	constructor(private readonly httpRequestsService: HttpRequestsService) {}

	// 代发 HTTP 请求
	@Post('send')
	send(@Body() dto: SendHttpRequestDto, @Req() request: Request & { user: JwtPayload }) {
		return this.httpRequestsService.send(dto, request.user.sub, request.user.isAdmin);
	}
}
