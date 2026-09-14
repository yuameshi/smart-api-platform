import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestFlow } from './entities/test-flow.entity';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { ProjectService } from '@/modules/project/project.service';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class TestFlowService {
	constructor(
		@InjectRepository(TestFlow)
		private readonly testFlowRepository: Repository<TestFlow>,
		private readonly projectService: ProjectService,
	) {}

	// 查询项目下的测试流程列表
	async findAllByProject(projectId: number, userId: number, isAdmin: boolean): Promise<TestFlow[]> {
		await this.projectService.findOneOwned(projectId, userId, isAdmin);
		return this.testFlowRepository.find({ where: { projectId }, order: { id: 'ASC' } });
	}

	// 确保测试流程属于当前用户或用户是管理员
	async findOneOwned(id: number, userId: number, isAdmin: boolean): Promise<TestFlow> {
		const flow = await this.testFlowRepository.findOneBy({ id });
		if (!flow) {
			throw new NotFoundException('测试流程不存在');
		}
		// 校验项目归属
		await this.projectService.findOneOwned(flow.projectId, userId, isAdmin);
		return flow;
	}

	async create(dto: CreateTestFlowDto, userId: number, isAdmin: boolean): Promise<TestFlow> {
		await this.projectService.findOneOwned(dto.projectId, userId, isAdmin);
		return this.testFlowRepository.save({ ...dto, description: dto.description ?? null });
	}

	async update(id: number, dto: UpdateTestFlowDto, userId: number, isAdmin: boolean): Promise<void> {
		await this.findOneOwned(id, userId, isAdmin);
		// 空请求直接返回，避免TypeORM空更新报错
		if (Object.keys(dto).length === 0) {
			return;
		}
		await this.testFlowRepository.update(id, dto as QueryDeepPartialEntity<TestFlow>);
	}

	async remove(id: number, userId: number, isAdmin: boolean): Promise<void> {
		await this.findOneOwned(id, userId, isAdmin);
		await this.testFlowRepository.delete(id);
	}
}
