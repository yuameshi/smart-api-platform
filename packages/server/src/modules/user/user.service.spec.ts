import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

/**
 * 用户服务单元测试
 * 测试 UserService 中各方法的业务逻辑是否正确
 * 使用 Jest 测试框架，通过模拟 Repository 来隔离数据库依赖
 */
describe('UserService', () => {
	let service: UserService;
	let repository: jest.Mocked<Repository<User>>;

	/**
	 * 每个测试用例执行前的准备工作
	 * 创建测试模块并模拟数据库仓库
	 */
	beforeEach(async () => {
		const mockRepository = {
			find: jest.fn(),
			findOneBy: jest.fn(),
			save: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getRepositoryToken(User),
					useValue: mockRepository,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		repository = module.get(getRepositoryToken(User));
	});

	/**
	 * 测试服务是否能够正确初始化
	 */
	it('应该被正确初始化', () => {
		expect(service).toBeDefined();
	});

	/**
	 * 测试 hello 方法是否返回正确的欢迎信息
	 */
	describe('hello', () => {
		it('应该返回正确的欢迎信息', () => {
			const result = service.hello();
			expect(result).toBe('Hello from User Service!');
		});
	});

	/**
	 * 测试 findAll 方法是否能够正确查询所有用户
	 */
	describe('findAll', () => {
		it('应该返回用户列表', async () => {
			const mockUsers: User[] = [
				{
					id: 1,
					username: 'testuser',
					email: 'test@example.com',
					password: 'hashed_password',
					createdAt: new Date(),
				},
			];
			repository.find.mockResolvedValue(mockUsers);

			const result = await service.findAll();

			expect(result).toEqual(mockUsers);
			expect(repository.find).toHaveBeenCalledTimes(1);
		});

		it('数据库中没有用户时应返回空数组', async () => {
			repository.find.mockResolvedValue([]);

			const result = await service.findAll();

			expect(result).toEqual([]);
		});
	});

	/**
	 * 测试 findOne 方法是否能够根据 ID 查询用户
	 */
	describe('findOne', () => {
		it('应该根据 ID 返回对应用户', async () => {
			const mockUser: User = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				createdAt: new Date(),
			};
			repository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.findOne(1);

			expect(result).toEqual(mockUser);
			expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
		});

		it('用户不存在时应返回 null', async () => {
			repository.findOneBy.mockResolvedValue(null);

			const result = await service.findOne(999);

			expect(result).toBeNull();
		});
	});

	/**
	 * 测试 create 方法是否能够正确创建用户
	 */
	describe('create', () => {
		it('应该创建并返回新用户', async () => {
			const createData = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'password123',
			};
			const mockCreatedUser: User = {
				id: 1,
				...createData,
				createdAt: new Date(),
			};
			repository.save.mockResolvedValue(mockCreatedUser);

			const result = await service.create(createData);

			expect(result).toEqual(mockCreatedUser);
			expect(repository.save).toHaveBeenCalledWith(createData);
		});
	});
});
