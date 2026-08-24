import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Controller('folder')
export class FolderController {
	constructor(private readonly folderService: FolderService) {}

	// 通过项目ID获取指定项目下的所有文件夹
	@Get()
	findAll(@Query('projectId', ParseIntPipe) projectId: number, @Req() request: Request & { user: JwtPayload }) {
		return this.folderService.listByProject(projectId, request.user.sub, request.user.isAdmin);
	}

	@Post()
	create(@Body() dto: CreateFolderDto, @Req() request: Request & { user: JwtPayload }) {
		return this.folderService.create(dto, request.user.sub, request.user.isAdmin);
	}

	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFolderDto, @Req() request: Request & { user: JwtPayload }) {
		return this.folderService.update(id, dto, request.user.sub, request.user.isAdmin);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.folderService.remove(id, request.user.sub, request.user.isAdmin);
	}
}
