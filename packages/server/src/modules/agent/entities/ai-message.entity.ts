import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { AiSession } from './ai-session.entity';

// AI 消息表，记录AI SDK UIMessage
@Entity('ai_message')
@Unique(['sessionId', 'messageId'])
export class AiMessage {
	@PrimaryGeneratedColumn()
	id: number;

	// 所属会话
	@Column({ name: 'session_id', type: 'varchar', length: 36 })
	sessionId: string;
	@ManyToOne(() => AiSession, session => session.messages, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'session_id' })
	session: AiSession;

	// AI SDK 消息 id
	// 同一会话内messageId唯一
	@Column({ name: 'message_id', type: 'varchar', length: 64 })
	messageId: string;

	@Column({ type: 'varchar', length: 16 })
	role: string;

	// UIMessage.parts JSON
	@Column({ type: 'json' })
	parts: unknown[];

	@Column({ type: 'json', nullable: true })
	metadata: unknown | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
