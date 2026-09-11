import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { Folder } from '@/modules/folder/entities/folder.entity';
import { ProjectService } from '@/modules/project/project.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { EditEndpointMetaDto } from './dto/edit-endpoint-meta.dto';
import { UpdateEndpointContentDto } from './dto/update-endpoint-content.dto';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class EndpointService {
	constructor(
		@InjectRepository(ApiEndpoint)
		private readonly endpointRepository: Repository<ApiEndpoint>,
		@InjectRepository(Folder)
		private readonly folderRepository: Repository<Folder>,
		private readonly projectService: ProjectService,
	) {}

	async listByProject(projectId: number, folderId: number | undefined, userId: number, isAdmin: boolean): Promise<ApiEndpoint[]> {
		await this.projectService.findOneOwned(projectId, userId, isAdmin);
		return this.endpointRepository.find({
			where: { projectId, ...(folderId !== undefined ? { folderId } : {}) },
			order: { id: 'ASC' },
		});
	}

	// 确保端点属于当前用户或管理员
	async findOneOwned(id: number, userId: number, isAdmin: boolean): Promise<ApiEndpoint> {
		const endpoint = await this.endpointRepository.findOneBy({ id });
		if (!endpoint) {
			throw new NotFoundException('API端点不存在');
		}
		// 校验项目归属
		await this.projectService.findOneOwned(endpoint.projectId, userId, isAdmin);
		return endpoint;
	}

	private async validateFolder(folderId: number, projectId: number): Promise<void> {
		const folder = await this.folderRepository.findOneBy({ id: folderId });
		if (!folder) {
			throw new NotFoundException('目标文件夹不存在');
		}
		if (folder.projectId !== projectId) {
			throw new BadRequestException('目标文件夹不属于该项目');
		}
	}

	async create(dto: CreateEndpointDto, userId: number, isAdmin: boolean): Promise<ApiEndpoint> {
		await this.projectService.findOneOwned(dto.projectId, userId, isAdmin);

		if (dto.folderId != null) {
			await this.validateFolder(dto.folderId, dto.projectId);
		}

		return this.endpointRepository.save({
			...dto,
			// method默认填GET
			method: 'GET',
			folderId: dto.folderId ?? null,
		});
	}

	// 修改端点信息
	async editMeta(id: number, dto: EditEndpointMetaDto, userId: number, isAdmin: boolean): Promise<void> {
		const endpoint = await this.findOneOwned(id, userId, isAdmin);
		// 移动时校验文件夹归属
		if (dto.folderId != null) {
			await this.validateFolder(dto.folderId, endpoint.projectId);
		}

		await this.endpointRepository.update(id, dto);
	}

	async updateContent(id: number, dto: UpdateEndpointContentDto, userId: number, isAdmin: boolean): Promise<void> {
		await this.findOneOwned(id, userId, isAdmin);
		await this.endpointRepository.update(id, dto as QueryDeepPartialEntity<ApiEndpoint>);
	}

	async remove(id: number, userId: number, isAdmin: boolean): Promise<void> {
		await this.findOneOwned(id, userId, isAdmin);
		await this.endpointRepository.delete(id);
	}
}
