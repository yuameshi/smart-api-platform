import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Project } from '@/modules/project/entities/project.entity';

@Entity('folder')
export class Folder {
	@PrimaryGeneratedColumn()
	id: number;

	// 项目ID（带外键约束）
	@Column({ name: 'project_id' })
	projectId: number;
	@ManyToOne(() => Project, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'project_id' })
	project: Project;

	// 父文件夹ID（带外键约束）
	@Column({ name: 'parent_id', nullable: true })
	parentId: number | null;
	// 父文件夹引用
	@ManyToOne(() => Folder, folder => folder.children, { onDelete: 'SET NULL' })
	@JoinColumn({ name: 'parent_id' })
	parent: Folder | null;
	// 子文件夹ID
	@OneToMany(() => Folder, folder => folder.parent)
	children: Folder[];

	@Column({ length: 100 })
	name: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
