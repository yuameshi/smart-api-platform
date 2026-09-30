import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { JwtPayload, TestRunEvent } from 'shared';
import { filter } from 'rxjs';
import { TestFlowService } from './test-flow.service';
import { TestFlowRunnerService } from './runner/test-flow-runner.service';
import { TestFlowRunRecordService } from './run/test-flow-run-record.service';
import { RunEventStream } from './run/run-event-stream';

import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { CreateTestStepDto } from './dto/create-test-step.dto';
import { UpdateTestStepDto } from './dto/update-test-step.dto';
import { ReorderTestStepsDto } from './dto/reorder-test-steps.dto';

@Controller('test-flow')
export class TestFlowController {
	constructor(
		private readonly testFlowService: TestFlowService,
		private readonly runnerService: TestFlowRunnerService,
		private readonly runRecordService: TestFlowRunRecordService,
		private readonly runEventStream: RunEventStream,
	) {}

	// 获取项目下全部测试流程（管理员可以直接看）
	@Get()
	findAll(@Query('projectId', ParseIntPipe) projectId: number, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.findAllByProject(projectId, request.user.sub, request.user.isAdmin);
	}

	// ==============================================
	// 测试运行部分
	// 触发运行，返回runId，客户端在后面通过sse订阅
	@Post(':flowId/runs')
	startRun(@Param('flowId', ParseIntPipe) flowId: number, @Req() request: Request & { user: JwtPayload }) {
		return this.runnerService.startRun(flowId, request.user.sub, request.user.isAdmin);
	}

	// 运行历史
	@Get(':flowId/runs')
	async listRuns(@Param('flowId', ParseIntPipe) flowId: number, @Req() request: Request & { user: JwtPayload }) {
		await this.testFlowService.findOneOwned(flowId, request.user.sub, request.user.isAdmin);
		return this.runRecordService.listByFlow(flowId);
	}

	// 运行详情
	@Get(':flowId/runs/:runId')
	async findRun(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Param('runId', ParseIntPipe) runId: number,
		@Req() request: Request & { user: JwtPayload },
	) {
		await this.testFlowService.findOneOwned(flowId, request.user.sub, request.user.isAdmin);
		return this.runRecordService.findByFlowAndId(flowId, runId);
	}

	// 停止运行
	@Post(':flowId/runs/:runId/stop')
	async stopRun(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Param('runId', ParseIntPipe) runId: number,
		@Req() request: Request & { user: JwtPayload },
	) {
		await this.testFlowService.findOneOwned(flowId, request.user.sub, request.user.isAdmin);
		await this.runRecordService.findByFlowAndId(flowId, runId);
		this.runnerService.stopRun(runId);
		return { stopped: true };
	}

	// SSE流式推送测试进程
	@Get(':flowId/runs/:runId/stream')
	async streamRun(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Param('runId', ParseIntPipe) runId: number,
		@Req() request: Request & { user: JwtPayload },
		// 使用手写Response绕开TransformInterceptor
		@Res() response: Response,
	) {
		await this.testFlowService.findOneOwned(flowId, request.user.sub, request.user.isAdmin);
		const run = await this.runRecordService.findByFlowAndId(flowId, runId);

		// 指定SSE响应头
		response.set({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
		});
		response.flushHeaders();

		const send = (event: TestRunEvent) => {
			response.write(`data: ${JSON.stringify(event)}\n\n`);
		};

		// 定时发心跳包
		const heartbeat = setInterval(() => {
			response.write(': ping\n\n');
		}, 20 * 1000);

		// 取消事件订阅，清除循环发心跳包
		const cleanup = () => {
			clearInterval(heartbeat);
			subscription.unsubscribe();
		};

		// 先订阅运行事件，按runId筛选
		const subscription = this.runEventStream.events$.pipe(filter(event => event.runId === runId)).subscribe(event => {
			send(event);
			// 运行结束时清理
			if (event.context.status !== 'running') {
				cleanup();
				response.end();
			}
		});

		// 发送当前状态
		const liveStatus = this.runnerService.getLatestContext(runId);
		const snapshot = liveStatus ?? this.runnerService.contextFromRunRecord(run);
		send({ runId, context: snapshot });

		// 完成运行的直接断开
		if (snapshot.status !== 'running') {
			cleanup();
			response.end();
			return;
		}

		// 浏览器主动断开时清理
		response.on('close', cleanup);
	}

	// ==============================================
	// 测试步骤增删改查

	// 获取步骤列表
	@Get(':flowId/steps')
	listSteps(@Param('flowId', ParseIntPipe) flowId: number, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.listSteps(flowId, request.user.sub, request.user.isAdmin);
	}

	// 获取单个步骤
	@Get(':flowId/steps/:stepId')
	findStep(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Param('stepId', ParseIntPipe) stepId: number,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.testFlowService.findStepOwned(flowId, stepId, request.user.sub, request.user.isAdmin);
	}

	// 新增步骤
	@Post(':flowId/steps')
	createStep(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Body() dto: CreateTestStepDto,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.testFlowService.createStep(flowId, dto, request.user.sub, request.user.isAdmin);
	}

	// 步骤排序
	@Patch(':flowId/steps/reorder')
	reorderSteps(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Body() dto: ReorderTestStepsDto,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.testFlowService.reorderSteps(flowId, dto.orderedIds, request.user.sub, request.user.isAdmin);
	}

	// 更新步骤
	@Patch(':flowId/steps/:stepId')
	updateStep(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Param('stepId', ParseIntPipe) stepId: number,
		@Body() dto: UpdateTestStepDto,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.testFlowService.updateStep(flowId, stepId, dto, request.user.sub, request.user.isAdmin);
	}

	// 删除步骤
	@Delete(':flowId/steps/:stepId')
	removeStep(
		@Param('flowId', ParseIntPipe) flowId: number,
		@Param('stepId', ParseIntPipe) stepId: number,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.testFlowService.removeStep(flowId, stepId, request.user.sub, request.user.isAdmin);
	}

	// ==============================================
	// 测试流程增删改查

	// 查
	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.findOneOwned(id, request.user.sub, request.user.isAdmin);
	}

	// 增
	@Post()
	create(@Body() dto: CreateTestFlowDto, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.create(dto, request.user.sub, request.user.isAdmin);
	}

	// 改
	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTestFlowDto, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.update(id, dto, request.user.sub, request.user.isAdmin);
	}

	// 删
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.remove(id, request.user.sub, request.user.isAdmin);
	}
}
