import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
