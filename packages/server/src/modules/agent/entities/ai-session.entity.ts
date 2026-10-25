import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { Project } from '@/modules/project/entities/project.entity';
import { AiMessage } from './ai-message.entity';

@Entity('ai_session')
export class AiSession {
	// uuid
	@PrimaryColumn({ type: 'varchar', length: 36 })
	id: string;

	// 删除用户时同步删除会话
	@Column({ name: 'user_id' })
	userId: number;
	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user_id' })
	user: User;

	// 删除项目时同步删除会话
	@Column({ name: 'project_id' })
	projectId: number;
	@ManyToOne(() => Project, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'project_id' })
	project: Project;

	@Column({ length: 100 })
	title: string;

	@OneToMany(() => AiMessage, message => message.session, { cascade: true })
	messages: AiMessage[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
