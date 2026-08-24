import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';

@Entity('project')
export class Project {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ length: 100 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string | null;

	// 所属用户ID（外键user.id）
	@Column({ name: 'owner_id' })
	ownerId: number;
	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'owner_id' })
	owner: User;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
