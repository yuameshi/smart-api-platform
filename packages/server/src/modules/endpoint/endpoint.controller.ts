import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from 'shared';
import { EndpointService } from './endpoint.service';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { EditEndpointMetaDto } from './dto/edit-endpoint-meta.dto';
import { UpdateEndpointContentDto } from './dto/update-endpoint-content.dto';

@Controller('endpoint')
export class EndpointController {
	constructor(private readonly endpointService: EndpointService) {}

	@Get()
	findAll(
		@Query('projectId', ParseIntPipe) projectId: number,
		@Query('folderId', new ParseIntPipe({ optional: true })) folderId: number | undefined,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.endpointService.listByProject(projectId, folderId, request.user.sub, request.user.isAdmin);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.endpointService.findOneOwned(id, request.user.sub, request.user.isAdmin);
	}

	@Post()
	create(@Body() dto: CreateEndpointDto, @Req() request: Request & { user: JwtPayload }) {
		return this.endpointService.create(dto, request.user.sub, request.user.isAdmin);
	}

	// 修改端点信息（给文件夹树用的快速修改接口）
	@Patch(':id/meta')
	editMeta(@Param('id', ParseIntPipe) id: number, @Body() dto: EditEndpointMetaDto, @Req() request: Request & { user: JwtPayload }) {
		return this.endpointService.editMeta(id, dto, request.user.sub, request.user.isAdmin);
	}

	// 更新整个端点数据
	@Patch(':id')
	updateContent(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateEndpointContentDto,
		@Req() request: Request & { user: JwtPayload },
	) {
		return this.endpointService.updateContent(id, dto, request.user.sub, request.user.isAdmin);
	}

	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request & { user: JwtPayload }) {
		return this.endpointService.remove(id, request.user.sub, request.user.isAdmin);
	}
}
