import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

	describe('toPublicUser', () => {
		it('应映射为对外用户对象', () => {
			const user = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: true,
				createdAt: new Date('2026-08-03T00:00:00.000Z'),
			};

			const result = service.toPublicUser(user);

			expect(result).toEqual({
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: '2026-08-03T00:00:00.000Z',
			});
			expect(result).not.toHaveProperty('password');
		});
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
					createdAt: expect.any(String),
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
				createdAt: expect.any(String),
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

			expect(result).toEqual({
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: expect.any(String),
			});
			expect(result).not.toHaveProperty('password');
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

			expect(result).toEqual({
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: expect.any(String),
			});
			expect(result).not.toHaveProperty('password');
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
		it('应该创建并返回新用户，密码以 bcrypt 哈希后入库', async () => {
			const createData = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'password123',
			};
			repository.save.mockResolvedValue({
				id: 1,
				username: 'newuser',
				email: 'new@example.com',
				password: 'some_hashed_value',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			} as User);

			const result = await service.create(createData);

			expect(result).toEqual({
				id: 1,
				username: 'newuser',
				email: 'new@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: expect.any(String),
			});
			expect(repository.save).toHaveBeenCalledTimes(1);
			const savedData = repository.save.mock.calls[0][0] as Partial<User>;
			expect(savedData.password).not.toBe('password123');
			expect(savedData.password).toMatch(/^\$2[ayb]\$/);
		});

		it('未提供密码时应抛出 BadRequestException 且不保存', async () => {
			const createData = {
				username: 'nopassuser',
				email: 'nopass@example.com',
			};

			await expect(service.create(createData)).rejects.toThrow(BadRequestException);
			await expect(service.create(createData)).rejects.toThrow('密码不能为空');
			expect(repository.save).not.toHaveBeenCalled();
		});
	});

	// 测试修改用户信息
	describe('update', () => {
		it('应该调用 repository.update 更新用户信息', async () => {
			const updateData = {
				username: 'updateduser',
				email: 'updated@example.com',
			};
			repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

			await service.update(1, updateData);

			expect(repository.update).toHaveBeenCalledWith(1, updateData);
			expect(repository.update).toHaveBeenCalledTimes(1);
		});

		it('应该能够更新部分字段', async () => {
			const updateData = {
				isActive: false,
			};
			repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

			await service.update(1, updateData);

			expect(repository.update).toHaveBeenCalledWith(1, { isActive: false });
		});
	});

	// 测试删除用户
	describe('delete', () => {
		it('应该调用 repository.delete 删除用户', async () => {
			repository.delete.mockResolvedValue({ affected: 1, raw: {} });

			await service.delete(1);

			expect(repository.delete).toHaveBeenCalledWith(1);
			expect(repository.delete).toHaveBeenCalledTimes(1);
		});

		it('应该能够删除指定 ID 的用户', async () => {
			repository.delete.mockResolvedValue({ affected: 1, raw: {} });

			await service.delete(999);

			expect(repository.delete).toHaveBeenCalledWith(999);
		});
	});

	// 测试自助修改个人设置
	describe('updateProfile', () => {
		const currentUser: User = {
			id: 1,
			username: 'olduser',
			email: 'old@example.com',
			password: 'old_hashed_password',
			isAdmin: false,
			isActive: true,
			createdAt: new Date('2026-08-01T00:00:00.000Z'),
		};

		const updatedUser: User = {
			id: 1,
			username: 'newuser',
			email: 'new@example.com',
			password: 'new_hashed_password',
			isAdmin: false,
			isActive: true,
			createdAt: new Date('2026-08-01T00:00:00.000Z'),
		};

		beforeEach(() => {
			repository.update.mockReset();
			repository.findOneBy.mockReset();
		});

		it('应能成功更新所有字段', async () => {
			const dto: UpdateProfileDto = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'newpassword',
			};

			repository.findOneBy
				.mockResolvedValueOnce(currentUser)
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(updatedUser);
			repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

			const result = await service.updateProfile(1, dto);

			expect(result).toEqual({
				id: 1,
				username: 'newuser',
				email: 'new@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: expect.any(String),
			});
			expect(result).not.toHaveProperty('password');

			expect(repository.update).toHaveBeenCalledTimes(1);
			const updateArg = repository.update.mock.calls[0][1] as Partial<User>;
			expect(updateArg.username).toBe('newuser');
			expect(updateArg.email).toBe('new@example.com');
			expect(updateArg.password).toBeDefined();
			expect(updateArg.password).not.toBe('newpassword');
			expect(updateArg.password).toMatch(/^\$2[ayb]\$/);

			//  调用了 findOneBy({ id })
			expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
			expect(repository.findOneBy).toHaveBeenCalledWith({ username: 'newuser' });
			expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'new@example.com' });
			// findOne 最后再调一次 findOneBy({ id })
			expect(repository.findOneBy).toHaveBeenCalledTimes(4);
		});

		it('应能够更新部分字段', async () => {
			const dto: UpdateProfileDto = { username: 'newuser' };

			repository.findOneBy.mockResolvedValueOnce(currentUser).mockResolvedValueOnce(null).mockResolvedValueOnce(updatedUser);
			repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

			const result = await service.updateProfile(1, dto);

			expect(result.username).toBe('newuser');
			expect(repository.update).toHaveBeenCalledTimes(1);
			const updateArg = repository.update.mock.calls[0][1] as Partial<User>;
			expect(updateArg).toEqual({ username: 'newuser' });
			expect(repository.findOneBy).not.toHaveBeenCalledWith(expect.objectContaining({ email: expect.any(String) }));
		});

		it('应在用户名被其他用户占用时抛出 ConflictException', async () => {
			const otherUser: User = { ...currentUser, id: 99, username: 'newuser' };
			const dto: UpdateProfileDto = { username: 'newuser' };

			repository.findOneBy.mockResolvedValueOnce(currentUser).mockResolvedValueOnce(otherUser);
			repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

			const err = await service.updateProfile(1, dto).catch(e => e);
			expect(err).toBeInstanceOf(ConflictException);
			expect(err.message).toBe('用户名已存在');
			expect(repository.update).not.toHaveBeenCalled();
		});
	});
});
