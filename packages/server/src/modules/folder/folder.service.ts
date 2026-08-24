import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { ApiEndpoint } from '@/modules/endpoint/entities/api-endpoint.entity';
import { ProjectService } from '@/modules/project/project.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FolderService {
	constructor(
		@InjectRepository(Folder)
		private readonly folderRepository: Repository<Folder>,
		@InjectRepository(ApiEndpoint)
		private readonly endpointRepository: Repository<ApiEndpoint>,
		private readonly projectService: ProjectService,
	) {}

	// 查询指定项目下的所有文件夹
	async listByProject(projectId: number, userId: number, isAdmin: boolean): Promise<Folder[]> {
		// 确保项目属于当前用户（或用户是管理员），下同
		await this.projectService.findOneOwned(projectId, userId, isAdmin);
		return this.folderRepository.find({ where: { projectId }, order: { id: 'ASC' } });
	}

	// 创建文件夹
	async create(dto: CreateFolderDto, userId: number, isAdmin: boolean): Promise<Folder> {
		await this.projectService.findOneOwned(dto.projectId, userId, isAdmin);

		// 校验父文件夹属于同项目
		if (dto.parentId != null) {
			const parent = await this.folderRepository.findOneBy({ id: dto.parentId });
			if (!parent) {
				throw new NotFoundException('父文件夹不存在');
			}
			if (parent.projectId !== dto.projectId) {
				throw new BadRequestException('父文件夹不属于该项目');
			}
		}

		return this.folderRepository.save(dto);
	}

	// 确保文件夹属于当前用户或管理员
	private async findOneOwned(id: number, userId: number, isAdmin: boolean): Promise<Folder> {
		const folder = await this.folderRepository.findOneBy({ id });
		if (!folder) {
			throw new NotFoundException('文件夹不存在');
		}

		// 通过项目校验归属
		await this.projectService.findOneOwned(folder.projectId, userId, isAdmin);
		return folder;
	}

	async update(id: number, dto: UpdateFolderDto, userId: number, isAdmin: boolean): Promise<void> {
		const folder = await this.findOneOwned(id, userId, isAdmin);

		if (dto.parentId !== undefined && dto.parentId !== null) {
			if (dto.parentId === id) {
				throw new BadRequestException('不能将文件夹移动到自身');
			}

			// 校验父文件夹属于同项目
			const parent = await this.folderRepository.findOneBy({ id: dto.parentId });
			if (!parent) {
				throw new NotFoundException('目标父文件夹不存在');
			}
			if (parent.projectId !== folder.projectId) {
				throw new BadRequestException('目标父文件夹不属于该项目');
			}

			// 校验避免成环
			const allFolders = await this.folderRepository.find({ where: { projectId: folder.projectId } });
			const subFolders = this.getSubFolders(id, allFolders);
			if (subFolders.some(f => f.id === dto.parentId)) {
				throw new BadRequestException('不能将文件夹移动到其子文件夹下');
			}
		}

		await this.folderRepository.update(id, dto);
	}

	// 递归收集指定文件夹的所有子文件夹
	private getSubFolders(parentId: number, allFolders: Folder[]): Folder[] {
		const result: Folder[] = [];
		const children = allFolders.filter(f => f.parentId === parentId);

		for (const child of children) {
			result.push(child);
			// 递归收集子孙
			result.push(...this.getSubFolders(child.id, allFolders));
		}

		return result;
	}

	// 递归删除文件夹和子文件夹
	async remove(id: number, userId: number, isAdmin: boolean): Promise<void> {
		const folder = await this.findOneOwned(id, userId, isAdmin);

		// 获取该项目下所有文件夹
		const allFolders = await this.folderRepository.find({ where: { projectId: folder.projectId } });

		// 收集全部子文件夹
		const toDelete = this.getSubFolders(id, allFolders);
		toDelete.push(folder); // 加上自身
		const folderIds = toDelete.map(f => f.id);

		if (folderIds.length > 0) {
			await this.endpointRepository.createQueryBuilder().delete().where('folder_id IN (:...folderIds)', { folderIds }).execute();
		}
		await this.folderRepository.delete(folderIds);
	}
}
