import { BadRequestException, Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { JwtPayload } from 'shared';
import { ProjectService } from '@/modules/project/project.service';
import { EndpointService } from '@/modules/endpoint/endpoint.service';
import { TestFlowService } from '@/modules/test-flow/test-flow.service';
import { AgentService } from './agent.service';
import { AiSessionService } from './ai-session.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import type { AiToolContext } from './tools/ai-tool-exec-wrapper';

// AI对话接口
@Controller('ai')
export class AiController {
	constructor(
		private readonly agentService: AgentService,
		private readonly sessionService: AiSessionService,
		private readonly projectService: ProjectService,
		private readonly endpointService: EndpointService,
		private readonly testFlowService: TestFlowService,
	) {}

	@Post('chat')
	async chat(@Body() body: ChatRequestDto, @Req() request: Request & { user: JwtPayload }, @Res() res: Response) {
		const userId = request.user.sub;
		const isAdmin = request.user.isAdmin;

		// 先校验会话是否是当前用户和当前项目的
		const session = await this.sessionService.findOneOwned(body.sessionId, userId, isAdmin);
		if (body.projectId !== session.projectId) {
			throw new BadRequestException('projectId与会话不一致');
		}

		// 构建工具上下文，从session中获取projectId
		const ctx: AiToolContext = {
			projectId: session.projectId,
			userId,
			isAdmin,
			sessionId: session.id,
			selectedTestFlowId: body.selectedTestFlowId,
			services: {
				projectService: this.projectService,
				endpointService: this.endpointService,
				testFlowService: this.testFlowService,
			},
		};

		await this.agentService.runStream(body, ctx, res);
	}
}
