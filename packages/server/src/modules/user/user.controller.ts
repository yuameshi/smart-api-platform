import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminGuard } from '@/common/guards/admin.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * /user
 * 用户控制器类
 * 写操作 (create/update/remove) 需要管理员权限，读操作仅需 JWT 认证。
 */
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * 获取系统中所有已注册的用户列表
	 * 返回用户列表的 JSON 数组
	 */
	@Get()
	findAll() {
		return this.userService.findAll();
	}

	/**
	 * 根据用户 ID 获取对应的用户信息
	 * 返回对应的用户对象
	 */
	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.userService.findOne(id);
	}

	/**
	 * 提交用户信息以创建新的用户记录
	 * 返回创建后的用户对象
	 */
	@UseGuards(AdminGuard)
	@Post()
	create(@Body() body: Partial<any>) {
		return this.userService.create(body);
	}

	/**
	 * 根据用户 ID 更新对应的用户信息
	 * 返回更新操作的结果（通常为空）
	 */
	@UseGuards(AdminGuard)
	@Patch(':id')
	update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(id, updateUserDto);
	}

	/**
	 * 根据用户 ID 删除对应的用户记录
	 * 返回删除结果
	 */
	@UseGuards(AdminGuard)
	@Delete(':id')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.userService.delete(id);
	}
}
