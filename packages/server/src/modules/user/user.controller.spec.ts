import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**
 * 用户控制器单元测试
 * 测试 UserController 中各路由处理函数是否正确调用服务层方法
 * 使用 Jest 测试框架，通过模拟 Service 来隔离业务逻辑依赖
 */
describe('UserController', () => {
	let controller: UserController;
	let service: jest.Mocked<UserService>;

	/**
	 * 每个测试用例执行前的准备工作
	 * 创建测试模块并模拟用户服务
	 */
	beforeEach(async () => {
		const mockService = {
			hello: jest.fn(),
			findAll: jest.fn(),
			findOne: jest.fn(),
			create: jest.fn(),
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

	/**
	 * 测试控制器是否能够正确初始化
	 */
	it('应该被正确初始化', () => {
		expect(controller).toBeDefined();
	});

	/**
	 * 测试 GET /user/hello 路由是否返回正确的响应
	 */
	describe('GET /user/hello', () => {
		it('应该返回包含欢迎信息的 JSON 对象', () => {
			service.hello.mockReturnValue('Hello from User Service!');

			const result = controller.hello();

			expect(result).toEqual({ message: 'Hello from User Service!' });
			expect(service.hello).toHaveBeenCalledTimes(1);
		});
	});

	/**
	 * 测试 GET /user 路由是否返回用户列表
	 */
	describe('GET /user', () => {
		it('应该返回所有用户列表', async () => {
			const mockUsers = [
				{
					id: 1,
					username: 'testuser',
					email: 'test@example.com',
					password: 'hashed_password',
					createdAt: new Date(),
				},
			];
			service.findAll.mockResolvedValue(mockUsers);

			const result = await controller.findAll();

			expect(result).toEqual(mockUsers);
			expect(service.findAll).toHaveBeenCalledTimes(1);
		});
	});

	/**
	 * 测试 GET /user/:id 路由是否返回单个用户
	 */
	describe('GET /user/:id', () => {
		it('应该根据 ID 返回对应用户', async () => {
			const mockUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				createdAt: new Date(),
			};
			service.findOne.mockResolvedValue(mockUser);

			const result = await controller.findOne('1');

			expect(result).toEqual(mockUser);
			expect(service.findOne).toHaveBeenCalledWith(1);
		});
	});

	/**
	 * 测试 POST /user 路由是否正确创建用户
	 */
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
});
