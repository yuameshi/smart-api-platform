import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import type { AiMessageInput, AiSessionDetail, AiSessionSummary, AiStoredMessage } from 'shared';
import { ProjectService } from '@/modules/project/project.service';
import { AiSession } from './entities/ai-session.entity';
import { AiMessage } from './entities/ai-message.entity';

// 新会话默认标题
export const DEFAULT_SESSION_TITLE = '新会话';

// AI会话管理服务
@Injectable()
export class AiSessionService {
	constructor(
		@InjectRepository(AiSession)
		private readonly sessionRepository: Repository<AiSession>,
		@InjectRepository(AiMessage)
		private readonly messageRepository: Repository<AiMessage>,
		private readonly projectService: ProjectService,
	) {}

	// 实体转列表类型
	private toSummary(session: AiSession & { messageCount?: number }): AiSessionSummary {
		return {
			id: session.id,
			projectId: session.projectId,
			title: session.title,
			messageCount: session.messageCount ?? 0,
			createdAt: session.createdAt.toISOString(),
			updatedAt: session.updatedAt.toISOString(),
		};
	}

	// 实体转消息类型
	private toStoredMessage(message: AiMessage): AiStoredMessage {
		return {
			id: message.messageId,
			role: message.role as AiStoredMessage['role'],
			parts: message.parts,
			metadata: message.metadata ?? undefined,
			createdAt: message.createdAt.toISOString(),
		};
	}

	// 创建会话
	async createForUser(projectId: number, userId: number, isAdmin: boolean, title?: string): Promise<AiSessionSummary> {
		await this.projectService.findOneOwned(projectId, userId, isAdmin);

		// 若有空对话啧复用空对话并更新创建时间
		const emptySession = await this.sessionRepository
			.createQueryBuilder('s')
			.leftJoin('s.messages', 'm')
			.where('s.projectId = :projectId', { projectId })
			.andWhere('s.userId = :userId', { userId })
			.groupBy('s.id')
			.having('COUNT(m.id) = 0')
			.orderBy('s.updatedAt', 'DESC')
			.getOne();
		if (emptySession) {
			const updatedAt = new Date();
			await this.sessionRepository.update(emptySession.id, { updatedAt });
			emptySession.updatedAt = updatedAt;
			return this.toSummary(emptySession);
		}

		const session = await this.sessionRepository.save(
			this.sessionRepository.create({
				id: crypto.randomUUID(),
				userId,
				projectId,
				title: title?.trim() ? title : DEFAULT_SESSION_TITLE,
			}),
		);
		return this.toSummary(session);
	}

	// 列出某项目下当前用户的会话
	async listForUser(projectId: number, userId: number): Promise<AiSessionSummary[]> {
		const sessions = await this.sessionRepository
			.createQueryBuilder('s')
			.where('s.projectId = :projectId', { projectId })
			.andWhere('s.userId = :userId', { userId })
			.orderBy('s.updatedAt', 'DESC')
			.getMany();
		if (sessions.length === 0) {
			return [];
		}
		// 统计每个会话的消息数
		const rows = await this.messageRepository
			.createQueryBuilder('m')
			.select('m.sessionId', 'sessionId')
			.addSelect('COUNT(*)', 'cnt')
			.where('m.sessionId IN (:...ids)', { ids: sessions.map(session => session.id) })
			.groupBy('m.sessionId')
			.getRawMany<{ sessionId: string; cnt: string }>();
		const countMap = new Map(rows.map(row => [row.sessionId, Number(row.cnt)]));
		return sessions.map(session =>
			this.toSummary(
				Object.assign(session, {
					messageCount: countMap.get(session.id) ?? 0,
				}),
			),
		);
	}

	// 会话归属校验
	async findOneOwned(id: string, userId: number, isAdmin: boolean): Promise<AiSession> {
		const session = await this.sessionRepository.findOne({ where: { id } });
		if (!session) {
			throw new NotFoundException('会话不存在');
		}
		if (session.userId !== userId && !isAdmin) {
			throw new ForbiddenException('您无权访问该会话');
		}
		return session;
	}

	// 获取含消息的会话详情
	async findDetail(id: string, userId: number, isAdmin: boolean): Promise<AiSessionDetail> {
		const session = await this.findOneOwned(id, userId, isAdmin);
		const messages = await this.messageRepository.find({
			where: { sessionId: session.id },
			order: { id: 'ASC' },
		});
		return {
			...this.toSummary(session),
			messageCount: messages.length,
			messages: messages.map(message => this.toStoredMessage(message)),
		};
	}

	// 删除会话
	async remove(id: string, userId: number, isAdmin: boolean): Promise<void> {
		const session = await this.findOneOwned(id, userId, isAdmin);
		await this.sessionRepository.delete(session.id);
	}

	// 使用事务批量追加消息
	async appendMessages(id: string, messages: AiMessageInput[]): Promise<void> {
		if (messages.length === 0) {
			return;
		}
		await this.sessionRepository.manager.transaction(async manager => {
			const messageRepository = manager.getRepository(AiMessage);
			for (const message of messages) {
				const existing = await messageRepository.findOne({
					where: { sessionId: id, messageId: message.id },
				});
				const metadata = message.metadata ?? null;
				if (!existing) {
					// 不存在则插入
					await messageRepository.insert({
						sessionId: id,
						messageId: message.id,
						role: message.role,
						parts: message.parts,
						metadata,
					} as QueryDeepPartialEntity<AiMessage>);
					continue;
				}
				// 内容一致则跳过，不一致则覆盖
				const partsChanged = JSON.stringify(existing.parts) !== JSON.stringify(message.parts);
				const metadataChanged = JSON.stringify(existing.metadata ?? null) !== JSON.stringify(metadata);
				if (partsChanged || metadataChanged || existing.role !== message.role) {
					await messageRepository.update(existing.id, {
						parts: message.parts,
						metadata,
						role: message.role,
					} as QueryDeepPartialEntity<AiMessage>);
				}
			}
			// 刷新会话更新时间
			await manager.getRepository(AiSession).update(id, { updatedAt: new Date() });
		});
	}

	// 修改会话标题
	async setTitle(id: string, title: string): Promise<void> {
		await this.sessionRepository.update(id, { title: title.slice(0, 100) });
	}

	// 取第一条user消息的纯文本
	getFirstUserText(messages: AiMessageInput[]): string {
		const firstUserMsg = messages.find(message => message.role === 'user');
		if (!firstUserMsg) {
			return '';
		}
		return firstUserMsg.parts
			.map(part => {
				const candidate = part as { type?: string; text?: string };
				return candidate?.type === 'text' && typeof candidate.text === 'string' ? candidate.text : '';
			})
			.join('')
			.trim();
	}
}
