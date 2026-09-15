import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';
import { TestFlowService } from './test-flow.service';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { CreateTestStepDto } from './dto/create-test-step.dto';
import { UpdateTestStepDto } from './dto/update-test-step.dto';

@Controller('test-flow')
export class TestFlowController {
	constructor(private readonly testFlowService: TestFlowService) {}

	// 获取项目下全部测试流程（管理员可以直接看）
	@Get()
	findAll(@Query('projectId', ParseIntPipe) projectId: number, @Req() request: Request & { user: JwtPayload }) {
		return this.testFlowService.findAllByProject(projectId, request.user.sub, request.user.isAdmin);
	}

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
