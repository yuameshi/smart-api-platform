import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('project')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	// 获取可见的项目列表（管理员可以看到全部项目）
	@Get()
	findAll(@Req() request: Request & { user: JwtPayload }) {
		return this.projectService.findAllForUser(request.user.sub, request.user.isAdmin);
	}

	// 根据ID获取项目
	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.projectService.findOneOwned(id, request.user.sub, request.user.isAdmin);
	}

	// 创建项目
	@Post()
	create(@Body() dto: CreateProjectDto, @Req() request: Request & { user: JwtPayload }) {
		return this.projectService.create(dto, request.user.sub);
	}

	// 更新项目
	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto, @Req() request: Request & { user: JwtPayload }) {
		return this.projectService.update(id, dto, request.user.sub, request.user.isAdmin);
	}

	// 删除项目
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.projectService.remove(id, request.user.sub, request.user.isAdmin);
	}
}
