import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { HttpMethod, PathParam, QueryParam, HeaderParam, RequestBody, ResponseExample } from 'shared';
import { Project } from '@/modules/project/entities/project.entity';
import { Folder } from '@/modules/folder/entities/folder.entity';

@Entity('api_endpoint')
export class ApiEndpoint {
	@PrimaryGeneratedColumn()
	id: number;

	// 所属项目ID（外键project.id）
	@Column({ name: 'project_id' })
	projectId: number;
	@ManyToOne(() => Project, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'project_id' })
	project: Project;

	// 所属文件夹ID（null表示在项目根）
	@Column({ name: 'folder_id', nullable: true })
	folderId: number | null;
	@ManyToOne(() => Folder, { onDelete: 'SET NULL' })
	@JoinColumn({ name: 'folder_id' })
	folder: Folder | null;

	@Column({ type: 'enum', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], default: 'GET' })
	method: HttpMethod;

	@Column({ length: 255 })
	path: string;

	@Column({ length: 200 })
	summary: string;

	@Column({ type: 'text', nullable: true })
	description: string | null;

	@Column({ type: 'json', nullable: true })
	tags: string[] | null;

	@Column({ type: 'json', nullable: true, name: 'path_params' })
	pathParams: PathParam[] | null;

	@Column({ type: 'json', nullable: true, name: 'query_params' })
	queryParams: QueryParam[] | null;

	@Column({ type: 'json', nullable: true })
	headers: HeaderParam[] | null;

	@Column({ type: 'json', nullable: true, name: 'request_body' })
	requestBody: RequestBody | null;

	@Column({ type: 'json', nullable: true })
	responses: ResponseExample[] | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
