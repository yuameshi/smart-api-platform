import { Injectable, Logger } from '@nestjs/common';
import {
	convertToModelMessages,
	createIdGenerator,
	generateText,
	isStepCount,
	pipeUIMessageStreamToResponse,
	streamText,
	toUIMessageStream,
	UIMessage,
} from 'ai';
import type { Response } from 'express';
import type { AiChatRequestBody } from 'shared';
import type { AiToolContext } from './tools/ai-tool-exec-wrapper';
import { AiModelFactory } from './ai-model.factory';
import { AiToolService } from './tools/ai-tool.service';
import { AiSessionService, DEFAULT_SESSION_TITLE } from './ai-session.service';
import { buildSystemPrompt } from './ai-system-prompt';

// AI SDK消息id生成器
const generateMessageId = createIdGenerator({ prefix: 'msg', size: 16 });

/**
 * ai agent服务
 */
@Injectable()
export class AgentService {
	private readonly logger = new Logger(AgentService.name);

	constructor(
		private readonly modelFactory: AiModelFactory,
		private readonly toolService: AiToolService,
		private readonly sessionService: AiSessionService,
	) {}

	async runStream(body: AiChatRequestBody, ctx: AiToolContext, res: Response): Promise<void> {
		const { model, maxSteps } = this.modelFactory.createModel();
		const tools = this.toolService.buildTools(ctx);
		const originalMessages = body.messages.map(message => ({
			id: message.id,
			role: message.role,
			parts: message.parts as UIMessage['parts'],
			metadata: message.metadata,
		}));

		const result = streamText({
			model,
			system: buildSystemPrompt(ctx),
			messages: await convertToModelMessages(originalMessages),
			tools,
			stopWhen: isStepCount(maxSteps),
		});

		// 客户端断开后继续执行会话
		void result.consumeStream({
			onError: error => {
				this.logger.error(`AI流处理出错: ${error instanceof Error ? error.message : String(error)}`);
			},
		});

		pipeUIMessageStreamToResponse({
			response: res,
			stream: toUIMessageStream({
				stream: result.stream,
				originalMessages,
				generateMessageId,
				onError: (error: unknown) => {
					const message = error instanceof Error ? error.message : String(error);
					this.logger.warn(`AI流出现错误: ${message}`);
					return message.length > 300 ? `${message.slice(0, 300)}...` : message;
				},
				onEnd: async ({ messages }) => {
					try {
						await this.sessionService.appendMessages(ctx.sessionId, messages);
						// 首轮结束后，若标题仍是默认值，则尝试生成标题
						const session = await this.sessionService.findOneOwned(ctx.sessionId, ctx.userId, ctx.isAdmin);
						if (session.title === DEFAULT_SESSION_TITLE) {
							const firstText = this.sessionService.getFirstUserText(messages);
							if (firstText) {
								try {
									const title = await this.generateTitle(firstText);
									await this.sessionService.setTitle(ctx.sessionId, title);
								} catch (error) {
									this.logger.error(`AI会话标题生成失败: ${error instanceof Error ? error.message : String(error)}`);
									await this.sessionService.setTitle(ctx.sessionId, firstText.slice(0, 20));
								}
							}
						}
					} catch (error) {
						this.logger.error(`AI 消息持久化失败: ${error instanceof Error ? error.message : String(error)}`);
					}
				},
			}),
		});
	}

	private async generateTitle(firstMessage: string): Promise<string> {
		const { model } = this.modelFactory.createModel();
		const result = await generateText({
			model,
			system:
				'你是一个会话标题生成器。根据用户消息生成一个简短的会话标题。' +
				'不超过20个字，直接输出标题本身，不要输出任何解释、引号或其他内容。' +
				'以下是用户消息的前500个字符，请根据它生成标题：',
			prompt: firstMessage.slice(0, 500),
		});
		// 去掉引号等前后缀，删除空格
		return result.text
			.trim()
			.replace(/^["'“”「『]+|["'“”」』]+$/g, '')
			.trim();
	}
}
