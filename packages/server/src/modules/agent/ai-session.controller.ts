import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';
import { AiSessionService } from './ai-session.service';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';

@Controller('ai/session')
export class AiSessionController {
	constructor(private readonly sessionService: AiSessionService) {}

	// 创建会话
	@Post()
	create(@Body() dto: CreateAiSessionDto, @Req() request: Request & { user: JwtPayload }) {
		return this.sessionService.createForUser(dto.projectId, request.user.sub, request.user.isAdmin, dto.title);
	}

	// 列出某项目下当前用户的会话
	@Get()
	list(@Query('projectId', ParseIntPipe) projectId: number, @Req() request: Request & { user: JwtPayload }) {
		return this.sessionService.listForUser(projectId, request.user.sub);
	}

	// 获取会话详情
	@Get(':id')
	detail(@Param('id') id: string, @Req() request: Request & { user: JwtPayload }) {
		return this.sessionService.findDetail(id, request.user.sub, request.user.isAdmin);
	}

	// 删除会话
	@Delete(':id')
	@HttpCode(204)
	remove(@Param('id') id: string, @Req() request: Request & { user: JwtPayload }) {
		return this.sessionService.remove(id, request.user.sub, request.user.isAdmin);
	}
}
