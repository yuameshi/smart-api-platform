import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestFlow } from './entities/test-flow.entity';
import { TestStep } from './entities/test-step.entity';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { CreateTestStepDto } from './dto/create-test-step.dto';
import { UpdateTestStepDto } from './dto/update-test-step.dto';
import { isStepConfigForType } from './dto/test-step-validators';
import { ProjectService } from '@/modules/project/project.service';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class TestFlowService {
	constructor(
		@InjectRepository(TestFlow)
		private readonly testFlowRepository: Repository<TestFlow>,
		@InjectRepository(TestStep)
		private readonly testStepRepository: Repository<TestStep>,
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

	// 测试步骤增删改查

	// 查询流程下的步骤（按顺序升序）
	async listSteps(flowId: number, userId: number, isAdmin: boolean): Promise<TestStep[]> {
		const flow = await this.findOneOwned(flowId, userId, isAdmin);
		return this.testStepRepository.find({ where: { testFlowId: flow.id }, order: { order: 'ASC' } });
	}

	// 确保步骤存在且属于该流程
	async findStepOwned(flowId: number, stepId: number, userId: number, isAdmin: boolean): Promise<TestStep> {
		const flow = await this.findOneOwned(flowId, userId, isAdmin);
		const step = await this.testStepRepository.findOneBy({ id: stepId });
		if (!step || step.testFlowId !== flow.id) {
			throw new NotFoundException('测试步骤不存在');
		}
		return step;
	}

	// 新增步骤
	async createStep(flowId: number, dto: CreateTestStepDto, userId: number, isAdmin: boolean): Promise<TestStep> {
		const flow = await this.findOneOwned(flowId, userId, isAdmin);
		// 确保添加到末尾
		const count = await this.testStepRepository.count({ where: { testFlowId: flow.id } });
		return this.testStepRepository.save({
			testFlowId: flow.id,
			order: count,
			type: dto.type,
			name: dto.name,
			config: dto.config,
		});
	}

	// 更新步骤（PATCH：合并后的 type/config 必须匹配）
	async updateStep(flowId: number, stepId: number, dto: UpdateTestStepDto, userId: number, isAdmin: boolean): Promise<void> {
		const step = await this.findStepOwned(flowId, stepId, userId, isAdmin);
		if (Object.keys(dto).length === 0) {
			return;
		}
		const nextType = dto.type ?? step.type;
		const nextConfig = dto.config ?? step.config;
		if (!isStepConfigForType(nextType, nextConfig)) {
			throw new BadRequestException('config 必须与 type 匹配');
		}
		await this.testStepRepository.update(step.id, dto as QueryDeepPartialEntity<TestStep>);
	}

	// 删除步骤
	async removeStep(flowId: number, stepId: number, userId: number, isAdmin: boolean): Promise<void> {
		const step = await this.findStepOwned(flowId, stepId, userId, isAdmin);
		await this.testStepRepository.manager.transaction(async manager => {
			await manager.delete(TestStep, step.id);
			// 将后续步骤顺序前移
			await manager
				.getRepository(TestStep)
				.createQueryBuilder()
				.update()
				.set({ order: () => 'step_order - 1' })
				.where('test_flow_id = :flowId AND step_order > :order', { flowId: step.testFlowId, order: step.order })
				.execute();
		});
	}
}
