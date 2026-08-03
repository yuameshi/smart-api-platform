import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

// 用户服务单元测试
describe('UserService', () => {
	let service: UserService;
	let repository: jest.Mocked<Repository<User>>;

	beforeEach(async () => {
		const mockRepository = {
			find: jest.fn(),
			findOneBy: jest.fn(),
			save: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
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

	// 测试服务是否能够正确初始化
	it('应该被正确初始化', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		it('应该返回用户列表', async () => {
			const mockUsers: User[] = [
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
			repository.find.mockResolvedValue(mockUsers);

			const result = await service.findAll();

			expect(result).toEqual([
				{
					id: 1,
					username: 'testuser',
					email: 'test@example.com',
					isAdmin: false,
					isActive: true,
					createdAt: expect.any(Date),
				},
			]);
			expect(repository.find).toHaveBeenCalledTimes(1);
		});

		it('数据库中没有用户时应返回空数组', async () => {
			repository.find.mockResolvedValue([]);

			const result = await service.findAll();

			expect(result).toEqual([]);
		});
	});

	describe('findOne', () => {
		it('应该根据 ID 返回对应用户', async () => {
			const mockUser: User = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			};
			repository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.findOne(1);

			expect(result).toEqual({
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: expect.any(Date),
			});
			expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
		});

		it('用户不存在时应返回 null', async () => {
			repository.findOneBy.mockResolvedValue(null);

			const result = await service.findOne(999);

			expect(result).toBeNull();
		});
	});

	describe('findByUsername', () => {
		it('应该根据用户名返回对应用户', async () => {
			const mockUser: User = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			};
			repository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.findByUsername('testuser');

			expect(result).toEqual(mockUser);
			expect(repository.findOneBy).toHaveBeenCalledWith({ username: 'testuser' });
		});

		it('用户名不存在时应返回 null', async () => {
			repository.findOneBy.mockResolvedValue(null);

			const result = await service.findByUsername('nonexistent');

			expect(result).toBeNull();
		});
	});

	describe('findByEmail', () => {
		it('应该根据邮箱返回对应用户', async () => {
			const mockUser: User = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			};
			repository.findOneBy.mockResolvedValue(mockUser);

			const result = await service.findByEmail('test@example.com');

			expect(result).toEqual(mockUser);
			expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
		});

		it('邮箱不存在时应返回 null', async () => {
			repository.findOneBy.mockResolvedValue(null);

			const result = await service.findByEmail('nonexistent@example.com');

			expect(result).toBeNull();
		});
	});

	// 测试新建用户
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
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			};
			repository.save.mockResolvedValue(mockCreatedUser);

			const result = await service.create(createData);

			expect(result).toEqual({
				id: 1,
				username: 'newuser',
				email: 'new@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: expect.any(Date),
			});
			expect(repository.save).toHaveBeenCalledWith(createData);
		});
	});

	// 测试修改用户信息
	describe('update', () => {
		it('应该调用 repository.update 更新用户信息', async () => {
			const updateData = {
				username: 'updateduser',
				email: 'updated@example.com',
			};
			repository.update.mockResolvedValue(undefined as any);

			await service.update(1, updateData);

			expect(repository.update).toHaveBeenCalledWith(1, updateData);
			expect(repository.update).toHaveBeenCalledTimes(1);
		});

		it('应该能够更新部分字段', async () => {
			const updateData = {
				isActive: false,
			};
			repository.update.mockResolvedValue(undefined as any);

			await service.update(1, updateData);

			expect(repository.update).toHaveBeenCalledWith(1, { isActive: false });
		});
	});

	// 测试删除用户
	describe('delete', () => {
		it('应该调用 repository.delete 删除用户', async () => {
			repository.delete.mockResolvedValue(undefined as any);

			await service.delete(1);

			expect(repository.delete).toHaveBeenCalledWith(1);
			expect(repository.delete).toHaveBeenCalledTimes(1);
		});

		it('应该能够删除指定 ID 的用户', async () => {
			repository.delete.mockResolvedValue(undefined as any);

			await service.delete(999);

			expect(repository.delete).toHaveBeenCalledWith(999);
		});
	});
});
