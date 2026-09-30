import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { TestRunContext } from 'shared';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TestFlowRun } from '../entities/test-flow-run.entity';

// 运行记录读写
@Injectable()
export class TestFlowRunRecordService implements OnModuleInit {
	constructor(
		@InjectRepository(TestFlowRun)
		private readonly runRepository: Repository<TestFlowRun>,
	) {}

	// 模块启动时清理running状态的记录
	async onModuleInit(): Promise<void> {
		await this.runRepository
			.createQueryBuilder()
			.update()
			.set({
				status: 'failed',
				error: '运行中断',
				endedAt: () => 'NOW(3)',
				durationMs: () => 'TIMESTAMPDIFF(MICROSECOND, started_at, NOW(3)) / 1000',
			})
			.where('status = :s', { s: 'running' })
			.execute();
	}

	async createRunningRecord(testFlowId: number, totalSteps: number, startedAt: number): Promise<TestFlowRun> {
		return this.runRepository.save({
			testFlowId,
			status: 'running',
			error: null,
			totalSteps,
			passedSteps: 0,
			stepResults: [],
			finalVars: {},
			startedAt: new Date(startedAt),
			endedAt: null,
			durationMs: null,
		});
	}

	// 保存当前运行进度
	async saveProgress(runId: number, context: TestRunContext): Promise<void> {
		const isEnded = context.status !== 'running';
		const patch = {
			stepResults: context.results,
			passedSteps: context.results.filter(result => result.status === 'success').length,
			...(isEnded
				? {
						status: context.status,
						error: context.error,
						finalVars: context.vars,
						endedAt: new Date(context.endedAt ?? Date.now()),
						durationMs: (context.endedAt ?? Date.now()) - context.startedAt,
					}
				: {}),
		};
		await this.runRepository.update(runId, patch as QueryDeepPartialEntity<TestFlowRun>);
	}

	// 查找该流程正在进行中的运行记录（用于并发互斥检查）
	async findRunningByFlow(testFlowId: number): Promise<TestFlowRun | null> {
		return this.runRepository.findOne({ where: { testFlowId, status: 'running' } });
	}

	async listByFlow(testFlowId: number): Promise<TestFlowRun[]> {
		return this.runRepository.find({
			where: { testFlowId },
			order: { id: 'DESC' },
		});
	}

	async findByFlowAndId(testFlowId: number, runId: number): Promise<TestFlowRun> {
		const run = await this.runRepository.findOneBy({ id: runId });
		if (!run || run.testFlowId !== testFlowId) {
			throw new NotFoundException('运行记录不存在');
		}
		return run;
	}
}
