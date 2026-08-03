import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

// 认证服务单元测试
describe('AuthService', () => {
	let service: AuthService;
	let userService: jest.Mocked<UserService>;
	let jwtService: jest.Mocked<JwtService>;

	beforeEach(async () => {
		const mockUserService = {
			findByUsername: jest.fn(),
			findByEmail: jest.fn(),
			create: jest.fn(),
		};

		const mockJwtService = {
			sign: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserService,
					useValue: mockUserService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
		userService = module.get(UserService);
		jwtService = module.get(JwtService);
	});

	it('应被正确定义', () => {
		expect(service).toBeDefined();
	});

	describe('register', () => {
		it('应成功注册并返回 access_token 和用户信息', async () => {
			const registerDto = {
				username: 'newuser',
				email: 'new@example.com',
				password: 'password123',
			};
			const mockToken = 'mock_jwt_token';

			userService.findByUsername.mockResolvedValue(null);
			userService.findByEmail.mockResolvedValue(null);
			userService.create.mockResolvedValue({
				id: 1,
				username: 'newuser',
				email: 'new@example.com',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			} as any);
			jwtService.sign.mockReturnValue(mockToken);

			// Mock bcrypt.hash
			jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);

			const result = await service.register(registerDto);

			expect(result).toEqual({
				access_token: mockToken,
				user: {
					id: 1,
					username: 'newuser',
					email: 'new@example.com',
					isAdmin: false,
					isActive: true,
					createdAt: expect.any(Date),
				},
			});
			expect(userService.findByUsername).toHaveBeenCalledWith('newuser');
			expect(userService.findByEmail).toHaveBeenCalledWith('new@example.com');
			expect(userService.create).toHaveBeenCalledWith({
				username: 'newuser',
				email: 'new@example.com',
				password: 'hashed_password',
			});
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: 1,
				username: 'newuser',
				isAdmin: false,
			});
		});

		it('用户名已存在时应抛出 ConflictException', async () => {
			const registerDto = {
				username: 'existinguser',
				email: 'new@example.com',
				password: 'password123',
			};
			const existingUser = {
				id: 1,
				username: 'existinguser',
				email: 'existing@example.com',
				password: 'hashed_password',
			};

			userService.findByUsername.mockResolvedValue(existingUser as any);

			await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
			await expect(service.register(registerDto)).rejects.toThrow('用户名已存在');
			expect(userService.findByEmail).not.toHaveBeenCalled();
		});

		it('邮箱已被注册时应抛出 ConflictException', async () => {
			const registerDto = {
				username: 'newuser',
				email: 'existing@example.com',
				password: 'password123',
			};
			const existingUser = {
				id: 1,
				username: 'otheruser',
				email: 'existing@example.com',
				password: 'hashed_password',
			};

			userService.findByUsername.mockResolvedValue(null);
			userService.findByEmail.mockResolvedValue(existingUser as any);

			await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
			await expect(service.register(registerDto)).rejects.toThrow('邮箱已被注册');
			expect(userService.create).not.toHaveBeenCalled();
		});
	});

	describe('login', () => {
		it('应成功登录并返回 access_token 和用户信息', async () => {
			const loginDto = {
				username: 'testuser',
				password: 'password123',
			};
			const mockUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: true,
				createdAt: new Date(),
			};
			const mockToken = 'mock_jwt_token';

			userService.findByUsername.mockResolvedValue(mockUser as any);
			jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
			jwtService.sign.mockReturnValue(mockToken);

			const result = await service.login(loginDto);

			expect(result).toEqual({
				access_token: mockToken,
				user: {
					id: 1,
					username: 'testuser',
					email: 'test@example.com',
					isAdmin: false,
					isActive: true,
					createdAt: expect.any(Date),
				},
			});
			expect(jwtService.sign).toHaveBeenCalledWith({
				sub: 1,
				username: 'testuser',
				isAdmin: false,
			});
		});

		it('用户未激活时应抛出 ForbiddenException', async () => {
			const loginDto = {
				username: 'inactiveuser',
				password: 'password123',
			};
			const mockUser = {
				id: 1,
				username: 'inactiveuser',
				email: 'inactive@example.com',
				password: 'hashed_password',
				isAdmin: false,
				isActive: false,
			};

			userService.findByUsername.mockResolvedValue(mockUser as any);
			jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

			await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
			await expect(service.login(loginDto)).rejects.toThrow('账户已被禁用，请联系管理员');
		});

		it('用户名或密码不正确时应抛出 UnauthorizedException', async () => {
			const loginDto = {
				username: 'testuser',
				password: 'wrongpassword',
			};

			userService.findByUsername.mockResolvedValue(null);

			await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
			await expect(service.login(loginDto)).rejects.toThrow('用户名或密码不正确');
		});

		it('密码不正确时应抛出 UnauthorizedException', async () => {
			const loginDto = {
				username: 'testuser',
				password: 'wrongpassword',
			};
			const mockUser = {
				id: 1,
				username: 'testuser',
				email: 'test@example.com',
				password: 'hashed_password',
				isActive: true,
			};

			userService.findByUsername.mockResolvedValue(mockUser as any);
			jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

			await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
		});
	});
});
