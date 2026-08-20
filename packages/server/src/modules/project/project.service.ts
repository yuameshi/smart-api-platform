import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
	constructor(
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
	) {}

	// 查询可见的项目列表
	async findAllForUser(userId: number, isAdmin: boolean): Promise<Project[]> {
		// admin 可查看全部项目
		if (isAdmin) {
			return this.projectRepository.find({ order: { id: 'ASC' } });
		}
		return this.projectRepository.find({ where: { ownerId: userId }, order: { id: 'ASC' } });
	}

	async findOneOwned(id: number, userId: number, isAdmin: boolean): Promise<Project> {
		const project = await this.projectRepository.findOneBy({ id });
		if (!project) {
			throw new NotFoundException('项目不存在');
		}
		if (!isAdmin && project.ownerId !== userId) {
			throw new ForbiddenException('无权访问该项目');
		}
		return project;
	}

	async create(dto: CreateProjectDto, ownerId: number): Promise<Project> {
		return this.projectRepository.save({ ...dto, ownerId });
	}

	async update(id: number, dto: UpdateProjectDto, userId: number, isAdmin: boolean): Promise<void> {
		await this.findOneOwned(id, userId, isAdmin);
		await this.projectRepository.update(id, dto);
	}

	async remove(id: number, userId: number, isAdmin: boolean): Promise<void> {
		await this.findOneOwned(id, userId, isAdmin);
		await this.projectRepository.delete(id);
	}
}
