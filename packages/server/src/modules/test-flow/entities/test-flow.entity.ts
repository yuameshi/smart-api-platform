import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '@/modules/project/entities/project.entity';

@Entity('test_flow')
export class TestFlow {
	@PrimaryGeneratedColumn()
	id: number;

	// 所属项目ID（外键project.id）
	@Column({ name: 'project_id' })
	projectId: number;
	@ManyToOne(() => Project, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'project_id' })
	project: Project;

	@Column({ length: 100 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
