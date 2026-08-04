import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import type { Request } from 'express';
import type { JwtPayload, PublicUser } from 'shared';

// 用户控制器单元测试
describe('UserController', () => {
	let controller: UserController;
	let service: jest.Mocked<UserService>;

	beforeEach(async () => {
		const mockService = {
			findAll: jest.fn(),
			findOne: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			updateProfile: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: mockService,
				},
			],
		}).compile();

		controller = module.get<UserController>(UserController);
		service = module.get(UserService);
	});

	// 测试控制器是否能够正确初始化
	it('应该被正确初始化', () => {
		expect(controller).toBeDefined();
	});

	// 测试用户列表
	describe('GET /user', () => {
		it('应该返回所有用户列表', async () => {
			const mockUsers: PublicUser[] = [
				{
					id: 1,
					username: 'testuser',
					email: 'test@example.com',
					isAdmin: false,
					isActive: true,
					createdAt: new Date().toISOString(),
				},
			];
			service.findAll.mockResolvedValue(mockUsers);

			const result = await controller.findAll();

			expect(result).toEqual(mockUsers);
			expect(service.findAll).toHaveBeenCalledTimes(1);
		});
	});

	// 测试获取单个用户
	describe('GET /user/:id', () => {
		it('应该根据 ID 返回对应用户', async () => {
			const mockUser: PublicUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: new Date().toISOString(),
			};
			service.findOne.mockResolvedValue(mockUser);

			const result = await controller.findOne(1);

			expect(result).toEqual(mockUser);
			expect(service.findOne).toHaveBeenCalledWith(1);
		});
	});

	// 测试创建用户
	describe('POST /user', () => {
		it('应该创建并返回新用户', async () => {
			const createData = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'password123',
			};
			const mockCreatedUser: PublicUser = {
				id: 1,
				username: createData.username,
				email: createData.email,
				isAdmin: false,
				isActive: true,
				createdAt: new Date().toISOString(),
			};
			service.create.mockResolvedValue(mockCreatedUser);

			const result = await controller.create(createData);

			expect(result).toEqual(mockCreatedUser);
			expect(service.create).toHaveBeenCalledWith(createData);
		});
	});

	// 测试修改用户
	describe('PATCH /user/:id', () => {
		it('应该调用 userService.update 更新用户信息', async () => {
			const updateData = {
				username: 'updateduser',
				email: 'updated@example.com',
			};
			service.update.mockResolvedValue(undefined);

			await controller.update(1, updateData);

			expect(service.update).toHaveBeenCalledWith(1, updateData);
			expect(service.update).toHaveBeenCalledTimes(1);
		});

		it('应该能够更新部分字段', async () => {
			const updateData = {
				isActive: false,
			};
			service.update.mockResolvedValue(undefined);

			await controller.update(2, updateData);

			expect(service.update).toHaveBeenCalledWith(2, { isActive: false });
		});
	});

	// 测试删除用户
	describe('DELETE /user/:id', () => {
		it('应该调用 userService.delete 删除用户', async () => {
			service.delete.mockResolvedValue(undefined);

			await controller.remove(1);

			expect(service.delete).toHaveBeenCalledWith(1);
			expect(service.delete).toHaveBeenCalledTimes(1);
		});

		it('应该能够删除指定 ID 的用户', async () => {
			service.delete.mockResolvedValue(undefined);

			await controller.remove(999);

			expect(service.delete).toHaveBeenCalledWith(999);
		});
	});

	// 测试自助修改个人设置
	describe('PATCH /user/profile', () => {
		const dto = { username: 'newuser' };
		const request = { user: { sub: 1, username: 'testuser', isAdmin: false } } as Request & { user: JwtPayload };

		it('应使用 JWT 载荷中的 sub 调用 userService.updateProfile', async () => {
			service.updateProfile.mockResolvedValue({
				id: 1,
				username: 'newuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: new Date().toISOString(),
			});

			await controller.updateProfile(request, dto);

			expect(service.updateProfile).toHaveBeenCalledWith(1, dto);
		});

		it('应返回更新后的 PublicUser', async () => {
			const mockUser: PublicUser = {
				id: 1,
				username: 'newuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: new Date().toISOString(),
			};
			service.updateProfile.mockResolvedValue(mockUser);

			const result = await controller.updateProfile(request, dto);

			expect(result).toEqual(mockUser);
		});
	});
});
