import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
			const mockUsers = [
				{
					id: 1,
					username: 'testuser',
					email: 'test@example.com',
					password: 'hashed_password',
					isAdmin: false,
					isActive: true,
					createdAt: new Date(),
				},
			];
			service.findAll.mockResolvedValue(mockUsers as any);

			const result = await controller.findAll();

			expect(result).toEqual(mockUsers);
			expect(service.findAll).toHaveBeenCalledTimes(1);
		});
	});

	// 测试获取单个用户
	describe('GET /user/:id', () => {
		it('应该根据 ID 返回对应用户', async () => {
			const mockUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			};
			service.findOne.mockResolvedValue(mockUser as any);

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
			const mockCreatedUser = {
				id: 1,
				...createData,
				createdAt: new Date(),
			};
			service.create.mockResolvedValue(mockCreatedUser as any);

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
});
